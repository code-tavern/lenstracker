import edge from 'edge.js'
import { edgeIconify, addCollection } from 'edge-iconify'
import { icons as MdiIcons } from '@iconify-json/mdi'


addCollection(MdiIcons)

/**
 * Register a plugin
 */
edge.use(edgeIconify)

edge.global('duration', (d: string) => {
  const hours = Math.floor(Number(d) / 60)
  const minutes = Number(d) % 60

  return `${hours}h${minutes > 0 ? ` ${minutes}min` : ''}`
})
