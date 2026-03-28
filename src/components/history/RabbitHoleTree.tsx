import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { RabbitHoleTree as RabbitHoleTreeType } from '@/types/history'
import { computeTreeLayout, NODE_WIDTH, NODE_HEIGHT } from '@/utils/treeLayout'
import type { PositionedNode, LayoutEdge } from '@/utils/treeLayout'
import '@/styles/graph.css'

const PADDING = 16

function TreeEdge({ edge }: { edge: LayoutEdge }) {
  const midX = (edge.fromX + edge.toX) / 2
  const d = edge.fromY === edge.toY
    ? `M ${edge.fromX} ${edge.fromY} L ${edge.toX} ${edge.toY}`
    : `M ${edge.fromX} ${edge.fromY} L ${midX} ${edge.fromY} L ${midX} ${edge.toY} L ${edge.toX} ${edge.toY}`

  return <path className="tree-edge" d={d} />
}

function TreeNode({ pn, onClick }: { pn: PositionedNode; onClick: () => void }) {
  const { node, x, y } = pn
  return (
    <foreignObject x={x} y={y} width={NODE_WIDTH} height={NODE_HEIGHT}>
      <div
        className={`tree-node ${node.finished ? 'tree-node--finished' : 'tree-node--in-progress'}`}
        onClick={onClick}
        title={node.title}
      >
        {node.thumbnail && (
          <img
            src={node.thumbnail}
            alt=""
            className="tree-node-thumb"
          />
        )}
        <span className="tree-node-title">{node.title}</span>
      </div>
    </foreignObject>
  )
}

export function RabbitHoleTree({ tree }: { tree: RabbitHoleTreeType }) {
  const navigate = useNavigate()
  const layout = useMemo(() => computeTreeLayout(tree.root), [tree.root])

  return (
    <div className="rabbit-hole-container">
      <svg
        width={layout.width + PADDING * 2}
        height={layout.height + PADDING * 2}
        viewBox={`${-PADDING} ${-PADDING} ${layout.width + PADDING * 2} ${layout.height + PADDING * 2}`}
      >
        {layout.edges.map((edge, i) => (
          <TreeEdge key={i} edge={edge} />
        ))}
        {layout.nodes.map((pn) => (
          <TreeNode
            key={pn.node.sessionId}
            pn={pn}
            onClick={() => navigate(`/wiki/${pn.node.slug}`)}
          />
        ))}
      </svg>
    </div>
  )
}
