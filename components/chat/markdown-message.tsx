'use client'

import { memo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Check, Copy } from 'lucide-react'

function CodeBlock({ language, value }: { language: string; value: string }) {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="my-3 overflow-hidden rounded-lg border border-border/60 bg-[#282c34]">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-1.5">
        <span className="text-xs font-medium text-zinc-400">{language || 'code'}</span>
        <button
          onClick={copy}
          className="flex items-center gap-1 text-xs text-zinc-400 transition-colors hover:text-zinc-100"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? 'Đã sao chép' : 'Sao chép'}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || 'text'}
        style={oneDark}
        customStyle={{ margin: 0, background: 'transparent', fontSize: '0.85rem' }}
        PreTag="div"
      >
        {value}
      </SyntaxHighlighter>
    </div>
  )
}

function MarkdownMessageImpl({ content }: { content: string }) {
  return (
    <div className="prose prose-invert prose-sm max-w-none prose-pre:my-0 prose-pre:bg-transparent prose-pre:p-0 prose-p:leading-relaxed prose-headings:text-foreground prose-a:text-primary">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '')
            const isInline = !className
            if (isInline) {
              return (
                <code
                  className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground"
                  {...props}
                >
                  {children}
                </code>
              )
            }
            return (
              <CodeBlock
                language={match?.[1] ?? ''}
                value={String(children).replace(/\n$/, '')}
              />
            )
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

export const MarkdownMessage = memo(MarkdownMessageImpl)
