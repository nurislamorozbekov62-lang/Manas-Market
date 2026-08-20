import { Link } from 'react-router-dom'

export default function Brand({ light = false }) {
  return <Link className={`brand${light ? ' light' : ''}`} to="/"><span>М</span> Manas Market</Link>
}
