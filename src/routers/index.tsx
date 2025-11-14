import React from 'react'
import type { RouteObject } from 'react-router-dom'

type ConfigureType = {
  verifToken?: boolean
  title?: string
  role: Array<'user' | 'administrator' | string>
}

export interface RouteOptions extends Omit<Omit<RouteObject, 'children'>, 'index'> {
  index?: boolean
  children?: RouteOptions[]
  configure?: ConfigureType
}

const ChatPage = React.lazy(() => import('@/pages/chat'))
const UserPage = React.lazy(() => import('@/pages/user'))
const LoginPage = React.lazy(() => import('@/pages/login'))
const SignupPage = React.lazy(() => import('@/pages/signup'))
const ResultPage = React.lazy(() => import('@/pages/result'))
const Page404 = React.lazy(() => import('@/pages/404'))

import AdminPage from '@/pages/admin'
import AdminDashboardPage from '@/pages/admin/dashboard'
import AdminCarmiPage from '@/pages/admin/carmi'
import AdminUserPage from '@/pages/admin/user'
import AdminTurnoverPage from '@/pages/admin/turnover'
import AdminSigninPage from '@/pages/admin/signin'
import AdminMessagePage from '@/pages/admin/message'
import AdminProductPage from '@/pages/admin/product'
import AdminAikeyPage from '@/pages/admin/aikey'
import AdminConfigPage from '@/pages/admin/config'
import AdminPaymentPage from '@/pages/admin/payment'
import AdminOrderPage from '@/pages/admin/order'
import AdminNotificationPage from '@/pages/admin/notification'
import AdminCashbackPage from '@/pages/admin/cashback'
import AdminInvitePage from '@/pages/admin/invite'
import AdminWithdrawalPage from '@/pages/admin/withdrawal'
import AdminAmountsPage from '@/pages/admin/amounts'
import AdminDialogPage from '@/pages/admin/dialog'
import AdminPersonaPage from '@/pages/admin/persona'
import AdminPluginPage from '@/pages/admin/plugin'
import AdminLoginPage from '@/pages/admin/login'

export const webRouter: RouteOptions[] = [
  {
    id: 'Home',
    path: '/',
    element: <ChatPage />,
    children: [],
    configure: {
      verifToken: true,
      role: ['user', 'administrator']
    }
  },
  {
    id: 'ChatPage',
    path: '/casey',
    element: <ChatPage />,
    children: [],
    configure: {
      verifToken: true,
      role: ['user', 'administrator']
    }
  },
  {
    id: 'UserPage',
    path: '/user',
    element: <UserPage />,
    children: [],
    configure: {
      verifToken: true,
      role: ['user', 'administrator']
    }
  },
  {
    id: 'LoginPage',
    path: '/login',
    element: <LoginPage />,
    children: [],
    configure: {
      verifToken: false,
      role: ['user', 'administrator']
    }
  },
  {
    id: 'SignupPage',
    path: '/signup',
    element: <SignupPage />,
    children: [],
    configure: {
      verifToken: false,
      role: ['user', 'administrator']
    }
  },
  {
    id: 'ResultPage',
    path: '/result',
    element: <ResultPage />,
    children: [],
    configure: {
      verifToken: false,
      role: ['user', 'administrator']
    }
  },
  {
    id: 'Page404',
    path: '/404',
    element: <Page404 />,
    children: [],
    configure: {
      verifToken: false,
      role: ['user', 'administrator']
    }
  },
  {
    id: 'Page404',
    path: '*',
    element: <Page404 />,
    children: [],
    configure: {
      verifToken: false,
      role: ['user', 'administrator']
    }
  }
]

export const adminRouter: RouteOptions[] = [
  {
    id: 'AdminLoginPage',
    path: '/admin/login',
    element: <AdminLoginPage />,
    children: [],
    configure: {
      verifToken: false,
      role: ['user', 'administrator']
    }
  },
  {
    id: 'AdminPage',
    path: '/admin',
    element: <AdminPage />,
    children: [
      {
        id: 'AdminDashboardPage',
        path: '/admin',
        element: <AdminDashboardPage />,
        index: true,
        configure: {
          title: 'Dashboard',
          verifToken: true,
          role: ['administrator']
        }
      },
      {
        id: 'AdminCarmiPage',
        path: '/admin/carmi',
        element: <AdminCarmiPage />,
        index: false,
        configure: {
          title: 'Activation Code Management',
          verifToken: true,
          role: ['administrator']
        }
      },
      {
        id: 'AdminUserPage',
        path: '/admin/user',
        element: <AdminUserPage />,
        index: false,
        configure: {
          title: 'User Management',
          verifToken: true,
          role: ['administrator']
        }
      },
      {
        id: 'AdminTurnoverPage',
        path: '/admin/turnover',
        element: <AdminTurnoverPage />,
        index: false,
        configure: {
          title: 'Consumption Records',
          verifToken: true,
          role: ['administrator']
        }
      },
      {
        id: 'AdminSigninPage',
        path: '/admin/signin',
        element: <AdminSigninPage />,
        index: false,
        configure: {
          title: 'Sign-in Records',
          verifToken: true,
          role: ['administrator']
        }
      },
      {
        id: 'AdminMessagePage',
        path: '/admin/messages',
        element: <AdminMessagePage />,
        index: false,
        configure: {
          title: 'Conversation Records',
          verifToken: true,
          role: ['administrator']
        }
      },
      {
        id: 'AdminDialogPage',
        path: '/admin/dialog',
        element: <AdminDialogPage />,
        index: false,
        configure: {
          title: 'Built-in Conversations',
          verifToken: true,
          role: ['administrator']
        }
      },
      {
        id: 'AdminProductPage',
        path: '/admin/product',
        element: <AdminProductPage />,
        index: false,
        configure: {
          title: 'Product List',
          verifToken: true,
          role: ['administrator']
        }
      },
      {
        id: 'AdminPaymentPage',
        path: '/admin/payment',
        element: <AdminPaymentPage />,
        index: false,
        configure: {
          title: 'Payment Configuration',
          verifToken: true,
          role: ['administrator']
        }
      },
      {
        id: 'AdminAikeyPage',
        path: '/admin/aikey',
        element: <AdminAikeyPage />,
        index: false,
        configure: {
          title: 'AI Key Management',
          verifToken: true,
          role: ['administrator']
        }
      },
      {
        id: 'AdminOrderPage',
        path: '/admin/order',
        element: <AdminOrderPage />,
        index: false,
        configure: {
          title: 'Order Management',
          verifToken: true,
          role: ['administrator']
        }
      },
      {
        id: 'AdminConfigPage',
        path: '/admin/config',
        element: <AdminConfigPage />,
        index: false,
        configure: {
          title: 'System Configuration',
          verifToken: true,
          role: ['administrator']
        }
      },
      {
        id: 'AdminNotificationPage',
        path: '/admin/notification',
        element: <AdminNotificationPage />,
        index: false,
        configure: {
          title: 'System Notification Configuration',
          verifToken: true,
          role: ['administrator']
        }
      },
      {
        id: 'AdminCashbackPage',
        path: '/admin/cashback',
        element: <AdminCashbackPage />,
        index: false,
        configure: {
          title: 'Consumption Commission Records',
          verifToken: true,
          role: ['administrator']
        }
      },
      {
        id: 'AdminInvitePage',
        path: '/admin/invite',
        element: <AdminInvitePage />,
        index: false,
        configure: {
          title: 'Invitation Records',
          verifToken: true,
          role: ['administrator']
        }
      },
      {
        id: 'AdminWithdrawalPage',
        path: '/admin/withdrawal',
        element: <AdminWithdrawalPage />,
        index: false,
        configure: {
          title: 'Withdrawal Records',
          verifToken: true,
          role: ['administrator']
        }
      },
      {
        id: 'AdminAmountsPage',
        path: '/admin/amounts',
        element: <AdminAmountsPage />,
        index: false,
        configure: {
          title: 'Amount Details',
          verifToken: true,
          role: ['administrator']
        }
      },
      {
        id: 'AdminPersonaPage',
        path: '/admin/persona',
        element: <AdminPersonaPage />,
        index: false,
        configure: {
          title: 'Persona Configuration',
          verifToken: true,
          role: ['administrator']
        }
      },
      {
        id: 'AdminPluginPage',
        path: '/admin/plugin',
        element: <AdminPluginPage />,
        index: false,
        configure: {
          title: 'Plugin Management',
          verifToken: true,
          role: ['administrator']
        }
      }
    ],
    configure: {
      verifToken: true,
      role: ['administrator']
    }
  }
]

export function searchRouteDetail(path: string, routes: RouteOptions[]): RouteOptions | null {
  let detail = null
  const forRouter = (path: string, routes: RouteOptions[]) => {
    for (const item of routes) {
      if (item.path === path) {
        detail = item
      }
      if (item.children && item.children.length > 0) {
        forRouter(path, item.children)
      }
    }
  }

  forRouter(path, routes)

  return detail
}

export default {}
