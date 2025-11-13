import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { adminRouter, searchRouteDetail, webRouter } from './index'
import { userStore, adminStore } from '@/store'

type AuthRouterProps = {
  children?: React.ReactNode
}

function AuthRouter(props: AuthRouterProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { token, user_info } = userStore()
  const { admin_token, admin_info } = adminStore()
  const { pathname } = location
  const routerDetail = searchRouteDetail(pathname, [...webRouter, ...adminRouter])
  const title = routerDetail?.configure?.title
  
  useEffect(() => {
    if (title) {
      document.title = title
    }
    
    // Special handling for admin routes
    if (pathname.startsWith('/admin')) {
      // Admin login page
      if (pathname === '/admin/login') {
        // If already logged in as admin, redirect to admin panel
        if (admin_token && admin_info) {
          navigate('/admin')
          return
        }
        // Otherwise, allow access to admin login page
        return
      }
      
      // Other admin routes - require admin authentication
      if (!admin_token || !admin_info) {
        navigate('/admin/login')
        return
      }
      // Admin is authenticated, allow access
      return
    }
    
    // If user is logged in and tries to access regular login or signup, redirect to home
    if (token && user_info && (pathname === '/login' || pathname === '/signup')) {
      navigate('/casey')
      return 
    }
    
    const userRole = user_info?.role || 'user'
    
    // For non-admin routes that require authentication
    if (routerDetail?.configure?.verifToken && !token) {
      navigate('/login', {
        state: {
          from: routerDetail?.path
        }
      })
    } else if (token && routerDetail && !routerDetail?.configure?.role.includes(userRole)) {
      // If user doesn't have the right role, redirect to 404
      navigate('/404')
    }
  }, [pathname, routerDetail, token, user_info, admin_token, admin_info, navigate])

  return <>{props.children}</>
}

export default AuthRouter
