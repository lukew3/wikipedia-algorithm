import { useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAtomValue } from 'jotai'
import ForceGraph2D from 'react-force-graph-2d'
import { historyGraphAtom } from '@/atoms/historyAtom'
import type { HistoryGraphNode } from '@/types/history'
import '@/styles/graph.css'

export function NetworkGraph() {
  const navigate = useNavigate()
  const graph = useAtomValue(historyGraphAtom)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleNodeClick = useCallback((node: HistoryGraphNode) => {
    navigate(`/wiki/${node.slug}`)
  }, [navigate])

  if (graph.nodes.length === 0) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        No reading history yet. Start exploring articles to build your network.
      </div>
    )
  }

  return (
    <div ref={containerRef} className="graph-container">
      <ForceGraph2D
        graphData={graph}
        nodeLabel={(node) => (node as HistoryGraphNode).title}
        nodeVal={(node) => Math.log((node as HistoryGraphNode).totalTimeMs + 1000) * 2}
        nodeColor={(node) => (node as HistoryGraphNode).finished ? '#22c55e' : '#f97316'}
        linkDirectionalArrowLength={4}
        linkDirectionalArrowRelPos={1}
        linkColor={() => 'rgba(150,150,150,0.4)'}
        onNodeClick={(node) => handleNodeClick(node as HistoryGraphNode)}
        width={containerRef.current?.offsetWidth ?? 800}
        height={containerRef.current?.offsetHeight ?? 500}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const n = node as HistoryGraphNode & { x?: number; y?: number }
          if (n.x === undefined || n.y === undefined) return
          const size = Math.log((n.totalTimeMs ?? 0) + 1000) * 2 / globalScale
          const label = n.title
          const fontSize = Math.max(10 / globalScale, 2)

          // Draw node circle
          ctx.beginPath()
          ctx.arc(n.x, n.y, size, 0, 2 * Math.PI)
          ctx.fillStyle = n.finished ? '#22c55e' : '#f97316'
          ctx.fill()
          ctx.strokeStyle = 'rgba(255,255,255,0.5)'
          ctx.lineWidth = 1 / globalScale
          ctx.stroke()

          // Draw label when zoomed in enough
          if (globalScale >= 0.6) {
            ctx.font = `${fontSize}px sans-serif`
            ctx.fillStyle = 'var(--color-text, #202122)'
            ctx.textAlign = 'center'
            ctx.fillText(label, n.x, n.y + size + fontSize + 1)
          }
        }}
      />
      <div className="graph-legend">
        <div className="graph-legend-item">
          <div className="graph-legend-dot" style={{ background: '#22c55e' }} />
          <span>Finished</span>
        </div>
        <div className="graph-legend-item">
          <div className="graph-legend-dot" style={{ background: '#f97316' }} />
          <span>In progress</span>
        </div>
      </div>
    </div>
  )
}
