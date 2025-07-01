import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false) // Default to a boolean value

  React.useEffect(() => {
    // This effect runs only on the client, after initial render
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    const onChange = () => {
      setIsMobile(mql.matches)
    }

    // Set the initial value on the client
    onChange();

    mql.addEventListener("change", onChange)

    return () => mql.removeEventListener("change", onChange)
  }, []) // Empty dependency array ensures this runs once on mount

  return isMobile
}
