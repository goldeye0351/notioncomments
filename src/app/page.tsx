
import NotionComments from '@/components/NotionComments'

export default function Home() {
  return (
    <div className="min-h-screen w-screen flex flex-col gap-8 py-8">
      <div className="w-full max-w-5xl mx-auto px-4 space-y-6">
        <h1 className="text-4xl font-bold">NotionComments </h1>
        <p className="text-xl text-muted-foreground">基于 Notion 数据库的简单评论组件系统</p>
        
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">特点</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>零配置数据库：直接使用 Notion 作为后端存储</li>
            <li>支持嵌套评论：可以无限层级回复</li>
            <li>简洁易用：只需配置环境变量即可使用</li>
            <li>响应式设计：适配各种屏幕尺寸</li>
            <li>Edge Runtime：快速的响应速度</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">使用方法</h2>
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">1. 环境配置</h3>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                NOTION_COMMENT_DATABASE_ID=your_database_id
            </pre>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
               NOTION_TOKEN=your_notion_token
            </pre>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-semibold">2. Notion 数据库配置</h3>
            <p>在 Notion 中创建数据库，需要包含以下字段：</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>PostId (title)</li>
              <li>ParentId (text)</li>
              <li>Content (text)</li>
              <li>IpAddress (text)</li>
              <li>Author (email)</li>
              <li>Level (number)</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-semibold">3. 组件使用</h3>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
{`<NotionComments 
  postId="your-post-id" 
  className="optional-class" 
  userEmail="optional-default-email" 
/>`}</pre>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">在线演示</h2>
          <NotionComments postId="notioncomments" />
        </div>
      </div>
    </div>
  )
}
