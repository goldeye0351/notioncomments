import { Client } from '@notionhq/client';
import { cache } from 'react';
import {   PageObjectResponse,  QueryDatabaseResponse} from '@notionhq/client/build/src/api-endpoints';

// 环境变量检查
const checkEnvVariables = () => {
  const requiredEnvVars = ['NOTION_COMMENT_DATABASE_ID', 'NOTION_TOKEN'];
  const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  }
};

checkEnvVariables();


const commentDatabaseId = process.env.NOTION_COMMENT_DATABASE_ID!;
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

//定义评论类型
export interface Comment {
    id: string;
    postId: string;
    parentId: string | null;
    content: string;
    author: string;
    level: number;
    createdTime: string;
  }

export const getCommentsByPostId = cache(async (postId?: string): Promise<Comment[]> => {
    const allComments: PageObjectResponse[] = [];
    let startCursor: string | undefined = undefined;
    let hasMore = true;
  
    while (hasMore) {
      const response = await notion.databases.query({
        database_id: commentDatabaseId,
        start_cursor: startCursor,
        page_size: 100,
        filter: postId ? {
          property: 'PostId',
          title: {
            equals: postId
          }
        } : undefined,
        sorts: [
          {
            property: 'CreatedTime',
            direction: 'descending',
          },
        ],
      }) as QueryDatabaseResponse;
  
      const comments = response.results.filter((comment): comment is PageObjectResponse => 'properties' in comment);
      allComments.push(...comments);
      hasMore = response.has_more;
      startCursor = response.next_cursor ?? undefined;
    }
  
    return allComments.map((comment) => {
      const { properties: props } = comment;
      return {
        id: comment.id,
        postId: props.PostId.type === 'rich_text' 
          ? props.PostId.rich_text[0]?.plain_text || '' : '',
        parentId: props.ParentId.type === 'rich_text' 
          ? props.ParentId.rich_text[0]?.plain_text || null : null,
        content: props.Content.type === 'rich_text'
          ? props.Content.rich_text.map(text => text.plain_text).join('') : '',
        author: props.Author.type === 'email' && props.Author.email
          ? props.Author.email.split('@')[0] 
          : 'anonymous',
        level: props.Level.type === 'number' && typeof props.Level.number === 'number'
          ? props.Level.number 
          : 1,
        createdTime: comment.created_time
      };
    });
  });



export interface CreateCommentInput {
  postId: string;
  content: string;
  author: string;
  parentId?: string;
  ipAddress: string; // 新增 IP 地址字段
}

export const createComment = cache(async (
  input: CreateCommentInput
): Promise<Comment> => {
  // 如果是回复评论，获取父评论的 level
  let level = 1;
  if (input.parentId) {
    const parentComment = await notion.pages.retrieve({ page_id: input.parentId });
    if ('properties' in parentComment && 
        parentComment.properties.Level.type === 'number') {
      level = (parentComment.properties.Level.number || 0) + 1;
    }
  }

  const response = await notion.pages.create({
    parent: { database_id: process.env.NOTION_COMMENT_DATABASE_ID! },
    properties: {
      PostId: {
        title:[{ text: { content: input.postId } }]
      },
      ParentId: {
        rich_text: input.parentId ? [{ text: { content: input.parentId } }] : []
      },
      Content: {
        rich_text: [{ text: { content: input.content } }]
      },
      Author: {
        email: input.author
      },
      Level: {
        number: level
      },
      IpAddress: { // 新增 IP 地址属性
        rich_text: [{ text: { content: input.ipAddress } }]
      }
    }
  });
  
    if (!('properties' in response)) {
      throw new Error('Failed to create comment');
    }
  
    return {
      id: response.id,
      postId: input.postId,
      parentId: input.parentId || null,
      content: input.content,
      author: input.author.split('@')[0],
      level,
      createdTime: response.created_time
    };
  });


export const getCommentsCountByPostId = cache(async (postId: string): Promise<number> => {
  const response = await notion.databases.query({
    database_id: commentDatabaseId,
    page_size: 1,
    filter: {
      property: 'PostId',
      title: {
        equals: postId
      }
    },
    // 只需要计数，不需要排序
  }) as QueryDatabaseResponse;

  return response.results.length;
});
