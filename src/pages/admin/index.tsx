import { DefaultFooter, PageContainer, ProLayout } from '@ant-design/pro-components'
import styles from './index.module.less'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { Dropdown } from 'antd'
import { LogoutOutlined } from '@ant-design/icons'
import React, { useState } from 'react'
import menuList from '@/routers/menu_list'
import { adminStore } from '@/store'
import OpenAiLogo from '@/components/OpenAiLogo'

function AdminPage() {
  const navigate = useNavigate()
  const { admin_token, admin_info, adminLogout } = adminStore()
  const [selectedKeys, setSelectedKeys] = useState<Array<string>>([])

  // Check for admin authentication
  if (!admin_token || !admin_info) {
    return (
      <div
        style={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <OpenAiLogo rotate width="3em" height="3em" />
      </div>
    )
  }
  return (
    <div className={styles.admin}>
      <ProLayout
        title="Admin Management System"
        logo={import.meta.env.VITE_APP_LOGO}
        layout="mix"
        splitMenus={false}
        contentWidth="Fluid"
        fixedHeader
        fixSiderbar
        theme="light"
        contentStyle={
          {
            //   height: 'calc(100vh - 10px)'
            //   background: 'red'
          }
        }
        siderMenuType="group"
        menu={{
          locale: false,
          collapsedShowGroupTitle: false,
        }}
        // settings={{}}
        suppressSiderWhenMenuEmpty
        siderWidth={260}
        onPageChange={(location) => {
          setSelectedKeys([`${location?.pathname}`])
        }}
        menuExtraRender={() => <div />}
        route={menuList.admin}
        menuItemRender={(item: any, dom: React.ReactNode) => {
          const target = item.path?.indexOf('http') != -1 ? '_blank' : '_self'
          return (
            <Link key={item.path} to={`${item.path}`} target={target}>
              {dom}
            </Link>
          )
        }}
        avatarProps={{
          src: admin_info?.avatar,
          size: 'small',
          title: 'Super Administrator',
          render: (props: any, dom: React.ReactNode) => {
            return (
              <Dropdown
                menu={{
                  items: [
                    {
                      key: 'logout',
                      icon: <LogoutOutlined />,
                      label: 'Admin Logout',
                      onClick: () => {
                        adminLogout()
                        navigate('/admin/login')
                      }
                    }
                  ]
                }}
              >
                {dom}
              </Dropdown>
            )
          }
        }}
        menuFooterRender={(props: any) => {
          if (props?.collapsed) return undefined
          return (
            <div
              style={{
                textAlign: 'center',
                paddingBlockStart: 12
              }}
            >
              <div>© 2025 Made with love</div>
              <div>by Chatgpt</div>
            </div>
          )
        }}
        menuProps={{
          onSelect: (e: any) => {
            if (e.key.indexOf('http') === -1 && !selectedKeys.includes(e.key)) {
              setSelectedKeys([...e.selectedKeys])
            }
          },
          onClick: (r: any) => {
            if (r.key.indexOf('http') === -1 && !selectedKeys.includes(r.key)) {
              setSelectedKeys([...r.keyPath])
            }
          },
          selectedKeys: [...selectedKeys],
          theme: 'light'
        }}
        breadcrumbRender={() => []}
      >
        <PageContainer>
          <Outlet />
        </PageContainer>
      </ProLayout>
    </div>
  )
}

export default AdminPage
