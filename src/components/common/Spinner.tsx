import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'

export function Spinner({ size = '1x' }: { size?: string }) {
  return (
    <FontAwesomeIcon
      icon={faSpinner}
      spin
      size={size as Parameters<typeof FontAwesomeIcon>[0]['size']}
      aria-label="Loading"
    />
  )
}
