'use client'

import { useState, useEffect } from 'react'
import { SendIcon } from 'lucide-react'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Input } from './ui/input'
import { Card } from './ui/card'
import { Label } from './ui/label'
interface Comment {
  id: string
  postId: string
  parentId: string | null
  content: string
  author: string
  level: number
  createdTime: string
}

interface CommentsProps {
  postId: string
  className?: string
  userEmail?: string
}

interface CommentWithChildren extends Comment {
  children: CommentWithChildren[]
}

export default function NotionComments({ postId, className, userEmail }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [content, setContent] = useState('')
  const [email, setEmail] = useState(userEmail || '')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/notion?postId=${postId}`)
      const data = await response.json() as Comment[]
      setComments(data)
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    }
  }

  useEffect(() => {
    fetchComments()
        // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || !email.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/notion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId,
          content,
          author: email,
          parentId: replyTo
        }),
      })

      if (!response.ok) throw new Error('Failed to submit comment')

      setContent('')
      setReplyTo(null)
      await fetchComments()
    } catch (error) {
      console.error('Error submitting comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const buildCommentTree = (comments: Comment[]): CommentWithChildren[] => {
    const commentMap = new Map<string, CommentWithChildren>()
    const roots: CommentWithChildren[] = []

    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, children: [] })
    })

    comments.forEach(comment => {
      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId)
        if (parent) {
          parent.children.push(commentMap.get(comment.id)!)
        }
      } else {
        roots.push(commentMap.get(comment.id)!)
      }
    })

    return roots
  }

  const renderComment = (comment: CommentWithChildren, level = 0) => (
    <div key={comment.id} className={` py-2 bg-accent/50 rounded-2xl  ${level > 0 ? 'ml-6' : ''}`}>
      <div className="px-4 ">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-foreground">{comment.author}</span>
            <span className="text-sm text-muted-foreground">
              {new Date(comment.createdTime).toLocaleString()}
            </span>
          </div>
        </div>
        <p className="text-sm text-foreground/90 leading-relaxed mt-1 mb-1">{comment.content}</p>
        <Button
          onClick={() => setReplyTo(comment.id)}
          variant="outline"
          size="sm"
          className="drawborder"
          data-umami-event='notioncomments点击评论'
        >
          回复
        </Button>
      </div>
      <div className="pl-4">
        {comment.children.map(child => renderComment(child, level + 1))}
      </div>
    </div>
  )

  return (
    <div id="comment" className={`${className} w-full max-w-5xl mx-auto space-y-6`}>
      <Card className="p-3">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Textarea
              value={content}
              id="pinglun"
              onChange={(e) => setContent(e.target.value)}
              placeholder={replyTo ? "回复评论..." : "写下你的评论...\n❖读而不评则罔,评而不读则殆❖"}
              className="min-h-[100px] resize-none bg-background pr-[160px]"
              required
            />
            <div className="absolute bottom-3 right-3 flex items-center space-x-2">
              <Input
                type="email"
                value={email}
                id="email"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="您的邮箱"
                className="w-40 h-8"
                required
              />
              <Button
                type="submit"
                variant="outline"
                size="sm"
                disabled={isSubmitting}
                className="h-8"
                data-umami-event='notioncomment发送评论'
              >
                <SendIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {replyTo && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setReplyTo(null)}
              className="mt-2"
              data-umami-event='notioncomments取消评论'
            >
              取消回复
            </Button>
          )}
        </form>
      </Card>

      <Card className="px-3">
        <div className="flex items-center justify-between mb-3">
          <Label className="text-lg font-semibold">评论列表</Label>
          <span className="text-sm text-muted-foreground">
            {comments.length} 条评论
          </span>
        </div>
        
        {comments.length === 0 ? (
          <p className="text-center text-muted-foreground py-6">
            还没有评论，来说两句吧~
          </p>
        ) : (
          <div className="space-y-2">
            {buildCommentTree(comments).map(comment => renderComment(comment))}
          </div>
        )}
      </Card>
    </div>
  )
}