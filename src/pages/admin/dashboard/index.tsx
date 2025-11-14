import { Card, Row, Col, Statistic, Typography, Space, Button, Spin, Tag } from 'antd'
import { 
  UserOutlined, 
  MessageOutlined, 
  KeyOutlined, 
  ShoppingCartOutlined,
  ReloadOutlined
} from '@ant-design/icons'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  getAdminUsers, 
  getAdminMessages, 
  getAdminAikeys, 
  getAdminOrders 
} from '@/request/adminApi'
import styles from './index.module.less'

const { Title, Text, Paragraph } = Typography

interface DashboardStats {
  totalUsers: number
  totalMessages: number
  totalAikeys: number
  totalOrders: number
  loading: boolean
}

function DashboardPage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalMessages: 0,
    totalAikeys: 0,
    totalOrders: 0,
    loading: true
  })

  const fetchStats = async () => {
    setStats(prev => ({ ...prev, loading: true }))
    try {
      const [usersRes, messagesRes, aikeysRes, ordersRes] = await Promise.all([
        getAdminUsers({ page: 1, page_size: 1 }),
        getAdminMessages({ page: 1, page_size: 1 }),
        getAdminAikeys({ page: 1, page_size: 1 }),
        getAdminOrders({ page: 1, page_size: 1 })
      ])

      setStats({
        totalUsers: usersRes.data?.count || 0,
        totalMessages: messagesRes.data?.count || 0,
        totalAikeys: aikeysRes.data?.count || 0,
        totalOrders: ordersRes.data?.count || 0,
        loading: false
      })
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
      setStats(prev => ({ ...prev, loading: false }))
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: UserOutlined,
      color: '#1890ff',
      path: '/admin/user'
    },
    {
      title: 'Total Messages',
      value: stats.totalMessages,
      icon: MessageOutlined,
      color: '#52c41a',
      path: '/admin/messages'
    },
    {
      title: 'API Keys',
      value: stats.totalAikeys,
      icon: KeyOutlined,
      color: '#faad14',
      path: '/admin/aikey'
    },
    // {
    //   title: 'Total Orders',
    //   value: stats.totalOrders,
    //   icon: ShoppingCartOutlined,
    //   color: '#f5222d',
    //   path: '/admin/order'
    // }
  ]

  const quickLinks = [
    { title: 'User Management', path: '/admin/user', icon: <UserOutlined /> },
    { title: 'Message Records', path: '/admin/messages', icon: <MessageOutlined /> },
    { title: 'AI Key Management', path: '/admin/aikey', icon: <KeyOutlined /> },
    // { title: 'Order Management', path: '/admin/order', icon: <ShoppingCartOutlined /> },
    // { title: 'System Configuration', path: '/admin/config', icon: <KeyOutlined /> },
    // { title: 'Product Management', path: '/admin/product', icon: <ShoppingCartOutlined /> }
  ]

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardHeader}>
        <div className={styles.headerContent}>
          <Title level={2} className={styles.headerTitle}>
            Dashboard Overview
          </Title>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={fetchStats}
            loading={stats.loading}
            className={styles.refreshButton}
            type="primary"
          >
            Refresh
          </Button>
        </div>
      </div>

      <Spin spinning={stats.loading}>
        <Row gutter={[16, 16]} className={styles.statsRow}>
          {statCards.map((card, index) => (
            <Col xs={24} sm={12} md={8} lg={8} xl={8} key={index}>
              <Card
                hoverable
                className={styles.statCard}
                onClick={() => navigate(card.path)}
                style={{
                  borderLeft: `4px solid ${card.color}`,
                  cursor: 'pointer'
                }}
              >
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Statistic
                      title={card.title}
                      value={card.value}
                      valueStyle={{ color: card.color, fontSize: 28, fontWeight: 'bold' }}
                    />
                    <div className={styles.iconWrapper} style={{ background: `${card.color}15` }}>
                      {React.createElement(card.icon, { style: { fontSize: 32, color: card.color } })}
                    </div>
                  </div>
                  <Tag color={card.color} style={{ marginTop: 8 }}>
                    View Details →
                  </Tag>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col xs={24} lg={16}>
            <Card 
              title="Quick Actions" 
              className={styles.quickActionsCard}
            >
              <Row gutter={[12, 12]}>
                {quickLinks.map((link, index) => (
                  <Col xs={24} sm={12} md={12} lg={8} key={index}>
                    <Button
                      type="default"
                      block
                      size="large"
                      icon={link.icon}
                      onClick={() => navigate(link.path)}
                      className={styles.quickLinkButton}
                    >
                      {link.title}
                    </Button>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card 
              title="System Status" 
              className={styles.statusCard}
            >
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div className={styles.statusItem}>
                  <div className={styles.statusLabel}>
                    <span>System Health</span>
                  </div>
                  <Tag color="green" className={styles.statusTag}>Operational</Tag>
                </div>
                <div className={styles.statusItem}>
                  <div className={styles.statusLabel}>
                    <span>Database</span>
                  </div>
                  <Tag color="green" className={styles.statusTag}>Connected</Tag>
                </div>
                <div className={styles.statusItem}>
                  <div className={styles.statusLabel}>
                    <span>API Services</span>
                  </div>
                  <Tag color="green" className={styles.statusTag}>Active</Tag>
                </div>
                <div className={styles.statusFooter}>
                  <Text type="secondary" className={styles.statusText}>
                    Last updated: {new Date().toLocaleTimeString()}
                  </Text>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col xs={24}>
            <Card 
              title="Welcome to Admin Dashboard" 
              className={styles.welcomeCard}
            >
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Paragraph>
                  This is your central command center for managing the AI chat platform. 
                  Use the statistics cards above to get a quick overview of your system, 
                  and navigate to specific sections using the quick action buttons.
                </Paragraph>
                <div>
                  <Title level={4}>Key Features:</Title>
                  <ul style={{ marginLeft: 20 }}>
                    <li>Monitor user activity and manage accounts</li>
                    <li>Track conversation records and messages</li>
                    <li>Manage API keys and configurations</li>
                    {/* <li>View and process orders</li> */}
                    {/* <li>Configure system settings</li> */}
                  </ul>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  )
}

export default DashboardPage

