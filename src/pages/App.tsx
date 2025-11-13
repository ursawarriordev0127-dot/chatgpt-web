import { useRoutes, Navigate } from 'react-router-dom'
import { webRouter, adminRouter } from '../routers'
import { useMemo } from 'react'
import { userStore, adminStore } from '@/store'

function App() {
  const { user_info, token } = userStore()
  const { admin_token, admin_info } = adminStore()

  const routers: Array<any> = useMemo(() => {
    let routerList = [...webRouter]

    // Always include admin login route
    const adminLoginRoute = adminRouter.find(route => route.path === '/admin/login')
    if (adminLoginRoute) {
      routerList.push(adminLoginRoute)
    }

    // For non-admin authenticated users, add a redirect from /admin and /admin/* to /admin/login
    if (!admin_token || !admin_info) {
      routerList.push({
        path: '/admin',
        element: <Navigate to="/admin/login" replace />
      })
      routerList.push({
        path: '/admin/*',
        element: <Navigate to="/admin/login" replace />
      })
    }

    // Include admin routes only for admin-authenticated users
    if (admin_token && admin_info) {
      const otherAdminRoutes = adminRouter.filter(route => route.path !== '/admin/login')
      routerList = [...routerList, ...otherAdminRoutes]
    }
    return routerList
  }, [user_info, token, admin_token, admin_info])

  const routesElement = useRoutes([...routers])
  return routesElement
}

export default App
