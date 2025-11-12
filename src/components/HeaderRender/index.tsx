import React, { useEffect, useState } from 'react'
import { HeaderViewProps } from '@ant-design/pro-layout/es/components/Header'
import styles from './index.module.less'
import {
  LogoutOutlined,
  MenuUnfoldOutlined,
  PayCircleOutlined,
  ReconciliationOutlined,
  UserOutlined
} from '@ant-design/icons'
import { chatStore, userStore } from '@/store'
import { Avatar, Dropdown } from 'antd'
import { getEmailPre } from '@/utils'
import MenuList from '../MenuList'
import { useNavigate, useLocation } from 'react-router-dom'

type IconProps = {
  className?: string
}

const SearchIcon = ({ className }: IconProps) => (
  <svg
    className={className}
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="8.75"
      cy="8.75"
      r="5.75"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line
      x1="13.1507"
      y1="13.1505"
      x2="17"
      y2="17"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const BellIcon = ({ className }: IconProps) => (
  <svg
    className={className}
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M15.25 12.25c-1.27-1.05-2.05-2.77-2.05-4.62V7.5a3.2 3.2 0 0 0-6.4 0v.13c0 1.85-.78 3.57-2.05 4.62l-.8.66a.6.6 0 0 0 .38 1.06h11.34a.6.6 0 0 0 .38-1.06l-.8-.66Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M11.5 16a1.5 1.5 0 0 1-3 0"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10 2.75V4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
)

const MessageIcon = ({ className }: IconProps) => (
  <svg
    className={className}
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="icon-20-message-v3"
  >
    <path
      d="M4.5 5.25a2.25 2.25 0 0 1 2.25-2.25h6.5a2.25 2.25 0 0 1 2.25 2.25v5.5a2.25 2.25 0 0 1-2.25 2.25H9.6l-2.1 1.75v-1.75H6.75A2.25 2.25 0 0 1 4.5 10.75v-5.5Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const BookmarkIcon = ({ className }: IconProps) => (
  <svg
    className={className}
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6.5 3.25h7a1 1 0 0 1 1 1V16l-4.5-2.7L5.5 16V4.25a1 1 0 0 1 1-1Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const ChevronDownIcon = ({ className }: IconProps) => (
  <svg
    className={className}
    aria-hidden="true"
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M2.5 4.5L6 8L9.5 4.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

function HeaderRender(props: HeaderViewProps) {
  const navigate = useNavigate()
  const location = useLocation()

  const { token, user_info, logout } = userStore()
  const { clearChats } = chatStore()

  const [logoMenuOpen, setLogoMenuOpen] = useState(false)
  const [windowWidth, setWindowWidth] = useState(
    typeof window === 'undefined' ? 1920 : window.innerWidth
  )

  const navItems = [
    { path: '/feed', label: 'Home' },
    { path: '/courses', label: 'Classroom' },
    { path: '/events', label: 'Live Trainings!' },
    { path: '/c/upcoming-events', label: 'Events!' },
    { path: '/casey', label: 'Casey' }
  ]

  const logoMenuItems: Array<{ key: string; icon: React.ReactNode; label: string }> = []

  const getUserInitials = () => {
    if (user_info?.nickname) {
      return user_info.nickname.substring(0, 2).toUpperCase()
    }
    if (user_info?.account) {
      const pre = getEmailPre(user_info.account)
      return pre.substring(0, 2).toUpperCase()
    }
    return 'AE'
  }

  const isActivePath = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname === ''
    }
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const DESKTOP_FULL_WIDTH = 1366
  const DESKTOP_COMPACT_WIDTH = 1024

  const isMobileView = props.isMobile || windowWidth <= DESKTOP_COMPACT_WIDTH
  const isCompactDesktop =
    !isMobileView && windowWidth > DESKTOP_COMPACT_WIDTH && windowWidth < DESKTOP_FULL_WIDTH
  const shouldShowDesktopNav = !isMobileView

  let visibleNavItems = [] as typeof navItems
  let overflowNavItems = [] as typeof navItems
  let isOverflowActive = false

  if (shouldShowDesktopNav) {
    if (isCompactDesktop) {
      visibleNavItems = navItems.slice(0, 2)
      overflowNavItems = navItems.slice(2)
      isOverflowActive = overflowNavItems.some((item) => isActivePath(item.path))
    } else {
      visibleNavItems = navItems
      overflowNavItems = []
    }
  }

  const overflowMenuItems = overflowNavItems.map((item) => ({
    key: item.path,
    label: item.label,
    onClick: () => navigate(item.path),
    className: isActivePath(item.path) ? styles.more_menu_item_active : styles.more_menu_item
  }))

  return (
    <nav
      data-testid="navigation-bar-wrapper"
      aria-label="Main navigation bar"
      className={styles.header}
      id="root-header-v2_1"
    >
      <div className={styles.header__inner}>
        {isMobileView && (
          <Dropdown
            arrow
            placement="bottomLeft"
            destroyPopupOnHide
            trigger={['click']}
            dropdownRender={() => {
              return <MenuList mode="inline" />
            }}
          >
            <button
              type="button"
              className={styles.mobile_menu_trigger}
              aria-label="Navigation menu"
            >
              <MenuUnfoldOutlined />
            </button>
          </Dropdown>
        )}
        <div className={styles.header__logoContainer} data-testid="dropdown">
          <Dropdown
            menu={{ 
              items: logoMenuItems,
              className: styles.logo_menu
            }}
            overlayClassName={styles.logo_dropdown_overlay}
            dropdownRender={(menu) => (
              <div className={styles.logo_dropdown_card}>
                {menu}
              </div>
            )}
            trigger={['click']}
            placement="bottomLeft"
            onOpenChange={(open) => setLogoMenuOpen(open)}
          >
            <div className={styles.logo_button_wrapper} data-testid="dropdown-button-wrapper">
              <button
                type="button"
                className={`${styles.logo_button} ${logoMenuOpen ? styles.logo_button_active : ''}`}
                data-testid="community-menu"
                onClick={(e) => e.preventDefault()}
              >
                <div className={styles.logo_button_inner}>
                  <div className={styles.logo_image_wrapper} id="community-logo-wrapper">
                    <img
                      id="community-logo"
                      src="/images/logo.jpeg"
                      alt="EngageLine SFG logo"
                      className={styles.logo_image}
                    />
                  </div>
                  <div
                    className={`${styles.logo_chevron} ${logoMenuOpen ? styles.logo_chevron_active : ''}`}
                  >
                    <ChevronDownIcon className={styles.logo_icon} />
                  </div>
                </div>
              </button>
            </div>
          </Dropdown>
        </div>

        {shouldShowDesktopNav && (
          <ul className={styles.header__nav} data-testid="header-navigation-bar">
            {visibleNavItems.map((item) => {
              const isActive = isActivePath(item.path)
              return (
                <li key={item.path} className={styles.nav_item_wrapper}>
                  <button
                    className={`${styles.nav_item} ${isActive ? styles.nav_item_active : ''}`}
                    onClick={() => navigate(item.path)}
                    title={item.label}
                    type="button"
                  >
                    {item.label}
                  </button>
                </li>
              )
            })}
            {overflowNavItems.length > 0 ? (
              <li className={styles.nav_item_wrapper}>
                <Dropdown
                  menu={{ items: overflowMenuItems }}
                  trigger={['click']}
                  placement="bottom"
                >
                  <button
                    type="button"
                    className={`${styles.nav_item} ${styles.nav_item_more} ${isOverflowActive ? styles.nav_item_active : ''
                      }`}
                  >
                    More <ChevronDownIcon className={styles.nav_item_more_icon} />
                  </button>
                </Dropdown>
              </li>
            ) : null}
          </ul>
        )}

        <div className={styles.header__actions} data-testid="right-action-block">
          {token ? (
            <Dropdown
              arrow
              placement="bottomRight"
              trigger={['click']}
              menu={{
                items: [
                  // {
                  //   key: 'yonghuzhongxin',
                  //   icon: <UserOutlined />,
                  //   label: 'User Center',
                  //   onClick: () => {
                  //     navigate('/user')
                  //   }
                  // },
                  // {
                  //   key: 'wodeyue',
                  //   icon: <PayCircleOutlined />,
                  //   label: 'My Balance',
                  //   onClick: () => {
                  //     navigate('/shop')
                  //   }
                  // },
                  // {
                  //   key: 'xiaofeijilu',
                  //   icon: <ReconciliationOutlined />,
                  //   label: 'Consumption Records',
                  //   onClick: () => {
                  //     navigate('/shop')
                  //   }
                  // },
                  {
                    key: 'tuichudenglu',
                    icon: <LogoutOutlined />,
                    label: 'Logout',
                    onClick: () => {
                      logout()
                      clearChats()
                      navigate('/login')
                    }
                  }
                ]
              }}
            >
              <button
                type="button"
                className={styles.avatar_button}
                data-testid="dropdown-button"
                aria-label="User menu options"
              >
                <Avatar
                  className={styles.user_avatar}
                  style={{
                    backgroundColor: '#166a29',
                    color: '#fff'
                  }}
                >
                  {getUserInitials()}
                </Avatar>
              </button>
            </Dropdown>
          ) : null}

        </div>
      </div>
    </nav>
  )
}

export default HeaderRender
