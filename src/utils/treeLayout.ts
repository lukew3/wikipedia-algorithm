import type { RabbitHoleNode } from '@/types/history'

export const NODE_WIDTH = 150
export const NODE_HEIGHT = 40
export const DEPTH_SPACING = 180
export const SIBLING_SPACING = 12

export interface PositionedNode {
  node: RabbitHoleNode
  x: number
  y: number
}

export interface LayoutEdge {
  fromX: number
  fromY: number
  toX: number
  toY: number
}

export interface TreeLayout {
  nodes: PositionedNode[]
  edges: LayoutEdge[]
  width: number
  height: number
}

function subtreeHeight(node: RabbitHoleNode): number {
  if (node.children.length === 0) return NODE_HEIGHT
  let total = 0
  for (let i = 0; i < node.children.length; i++) {
    if (i > 0) total += SIBLING_SPACING
    total += subtreeHeight(node.children[i])
  }
  return Math.max(NODE_HEIGHT, total)
}

function layoutNode(
  node: RabbitHoleNode,
  x: number,
  y: number,
  nodes: PositionedNode[],
  edges: LayoutEdge[],
) {
  nodes.push({ node, x, y })

  let childY = y
  for (const child of node.children) {
    edges.push({
      fromX: x + NODE_WIDTH,
      fromY: y + NODE_HEIGHT / 2,
      toX: x + DEPTH_SPACING,
      toY: childY + NODE_HEIGHT / 2,
    })
    layoutNode(child, x + DEPTH_SPACING, childY, nodes, edges)
    childY += subtreeHeight(child) + SIBLING_SPACING
  }
}

export function computeTreeLayout(root: RabbitHoleNode): TreeLayout {
  const nodes: PositionedNode[] = []
  const edges: LayoutEdge[] = []

  layoutNode(root, 0, 0, nodes, edges)

  let maxX = 0
  let maxY = 0
  for (const n of nodes) {
    if (n.x + NODE_WIDTH > maxX) maxX = n.x + NODE_WIDTH
    if (n.y + NODE_HEIGHT > maxY) maxY = n.y + NODE_HEIGHT
  }

  return { nodes, edges, width: maxX, height: maxY }
}
