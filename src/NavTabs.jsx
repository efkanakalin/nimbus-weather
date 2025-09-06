import { Tabs, Tab } from "@heroui/react"
import { useNavigate, useLocation } from "react-router-dom"

export default function NavTabs() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <Tabs
      selectedKey={location.pathname}
      onSelectionChange={(key) => navigate(key)}
    >
      <Tab key="/" title="Weather" />
      <Tab key="/about" title="About" />
    </Tabs>
  )
}