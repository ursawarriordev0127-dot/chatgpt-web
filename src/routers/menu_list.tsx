import {
  CalculatorFilled,
  CommentOutlined,
  ContactsFilled,
  CrownFilled,
  DropboxCircleFilled,
  ExperimentFilled,
  FileTextFilled,
  GithubFilled,
  GithubOutlined,
  GitlabFilled,
  GoldenFilled,
  IdcardFilled,
  InsuranceFilled,
  LockFilled,
  MediumSquareFilled,
  MessageFilled,
  MoneyCollectFilled,
  NotificationFilled,
  ReconciliationFilled,
  RedEnvelopeFilled,
  RedditCircleFilled,
  ScheduleFilled,
  SettingFilled,
  ShopFilled,
  SmileFilled,
  UsergroupAddOutlined,
  WalletFilled
} from '@ant-design/icons'

const web = [
  {
    path: '/',
    name: 'Chat',
    icon: <CommentOutlined />,
    message: 'Chat with intelligent AI'
  },
  {
    path: '/user',
    name: 'Invite',
    icon: <UsergroupAddOutlined />,
    message: 'Account balance and recharge package records'
  },
  {
    path: 'https://github.com/79E/ChatGpt-Web',
    name: 'Project URL',
    icon: <GithubOutlined />,
    message: 'Free open source commercializable AI Web project'
  }
]

const admin = {
  path: '/',
  routes: [
    {
      path: '/admin',
      name: 'Welcome',
      icon: <SmileFilled />
    },
    {
      path: '/admin_base',
      name: 'Basic Management',
      icon: <ExperimentFilled />,
      access: 'canAdmin',
      component: './Admin',
      routes: [
        {
          path: '/admin/carmi',
          name: 'Activation Code Management',
          icon: <LockFilled />
        },
        {
          path: '/admin/aikey',
          name: 'AI Key Management',
          icon: <InsuranceFilled />
        }
      ]
    },
    {
      path: '/admin_user',
      name: 'User Management',
      icon: <CrownFilled />,
      access: 'canAdmin',
      component: './Admin',
      routes: [
        {
          path: '/admin/user',
          name: 'User List',
          icon: <IdcardFilled />
        },
        {
          path: '/admin/turnover',
          name: 'Consumption Records',
          icon: <ReconciliationFilled />
        },
        {
          path: '/admin/signin',
          name: 'Sign-in Records',
          icon: <ScheduleFilled />
        },
        {
          path: '/admin/invite',
          name: 'Invitation Records',
          icon: <ContactsFilled />
        },
        {
          path: '/admin/cashback',
          name: 'Commission',
          icon: <CalculatorFilled />
        },
        {
          path: '/admin/withdrawal',
          name: 'Withdrawal Requests',
          icon: <RedEnvelopeFilled />
        },
        {
          path: '/admin/amounts',
          name: 'Balance Details',
          icon: <MediumSquareFilled />
        },
      ]
    },
    {
      name: 'Functional Management',
      icon: <MessageFilled />,
      path: '/admin_message',
      routes: [
        {
          path: '/admin/dialog',
          name: 'Built-in Conversations',
          icon: <GitlabFilled />
        },
        {
          path: '/admin/persona',
          name: 'Persona Configuration',
          icon: <RedditCircleFilled />
        },
        {
          path: '/admin/plugin',
          name: 'Plugin Management',
          icon: <DropboxCircleFilled />
        },
        {
          path: '/admin/messages',
          name: 'Message List',
          icon: <FileTextFilled />
        },
      ]
    },
    {
      path: '/admin_orders',
      name: 'Products & Orders',
      icon: <GoldenFilled />,
      routes: [
        {
          path: '/admin/product',
          name: 'Product List',
          icon: <ShopFilled />
        },
        {
          path: '/admin/payment',
          name: 'Payment Configuration',
          icon: <MoneyCollectFilled />
        },
        {
          path: '/admin/order',
          name: 'Payment Orders',
          icon: <WalletFilled />
        }
      ]
    },
    {
      name: 'Notification Configuration',
      path: '/admin/notification',
      icon: <NotificationFilled />
    },
    {
      path: '/admin/config',
      name: 'System Configuration',
      icon: <SettingFilled />
    },
    {
      path: 'https://github.com/79E/ChatGpt-Web',
      name: 'Github',
      icon: <GithubFilled />
    }
  ]
}

export default {
  web,
  admin
}
