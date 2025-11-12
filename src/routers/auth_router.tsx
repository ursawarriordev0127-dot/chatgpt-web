import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { adminRouter, searchRouteDetail, webRouter } from './index'
import { userStore } from '@/store'

type AuthRouterProps = {
  children?: React.ReactNode
}

function AuthRouter(props: AuthRouterProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { token, user_info } = userStore()
  const { pathname } = location
  const routerDetail = searchRouteDetail(pathname, [...webRouter, ...adminRouter])
  const title = routerDetail?.configure?.title
  
  useEffect(() => {
    if (title) {
      document.title = title
    }
    
    // If user is logged in and tries to access login or signup, redirect to home
    if (token && user_info && (pathname.includes('/login') || pathname.includes('/signup'))) {
      navigate('/casey')
      return 
    }
    
    const userRole = user_info?.role || 'user'
    
    // If route requires authentication and user is not logged in, redirect to login
    if (routerDetail?.configure?.verifToken && !token) {
      navigate('/login', {
        state: {
          from: routerDetail?.path
        }
      })
    } else if (token && !routerDetail?.configure?.role.includes(userRole)) {
      // If user doesn't have the right role, redirect to 404
      navigate('/404')
    }
  }, [pathname, routerDetail, token, user_info])

  return <>{props.children}</>
}

export default AuthRouter
