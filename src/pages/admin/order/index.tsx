import { getAdminOrders } from '@/request/adminApi';
import { OrderInfo } from '@/types/admin';
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Modal, Tag } from 'antd';
import { useRef, useState } from 'react';
import styles from './index.module.less';

function OrderPage() {

    const tableActionRef = useRef<ActionType>();
    const [isModalOpen, setIsModalOpen] = useState({
        open: false,
        title: '',
        json: ''
    });

    const columns: ProColumns<OrderInfo>[] = [
        {
            title: 'ID',
            dataIndex: 'id',
            width: 180,
            fixed: 'left'
        },
        {
            title: 'Payment ID',
            dataIndex: 'trade_no',
            render: (_, data) => (
                <a onClick={() => {
                    if (data.notify_info && data.trade_no) {
                        setIsModalOpen({
                            title: 'Payment Notification Parameters',
                            json: data.notify_info,
                            open: true
                        })
                    }
                }
                }

                >{data.trade_no ? data.trade_no : 'Unpaid'}
                </a>
            )
        },
        {
            title: 'Product Title',
            dataIndex: 'product_title',
            render: (_, data) => (
                <a onClick={() => {
                    setIsModalOpen({
                        title: 'Product Information',
                        json: data.product_info,
                        open: true
                    })
                }}
                >{data.product_title}
                </a>
            )
        },
        {
            title: 'Payment Type',
            dataIndex: 'pay_type',
            width: 120,
            render: (_, data) => {
                const type: { [key: string]: { [key: string]: string } } = {
                    alipay: {
                        color: 'blue',
                        text: 'Alipay'
                    },
                    wxpay: {
                        color: 'green',
                        text: 'WeChat'
                    },
					qqpay: {
                        color: 'geekblue',
                        text: 'QQ Pay'
                    }
                }
                return <Tag color={type[data.pay_type].color}>{type[data.pay_type].text}</Tag>
            }
        },
        {
            title: 'Payment Amount',
            dataIndex: 'money',
            width: 120,
            render: (_, data) => <Tag color="blue">{data.money} yuan</Tag>
        },
        {
            title: 'Order Status',
            dataIndex: 'trade_status',
            width: 180,
            render: (_, data) => {
                const status:{ [key: string]: { [key: string]: string } } = {
                    WAIT_BUYER_PAY: {
                        color: 'orange',
                        text: 'Waiting for Payment'
                    },
                    TRADE_SUCCESS: {
                        color: 'green',
                        text: 'Payment Successful'
                    },
                    TRADE_CLOSED: {
                        color: 'red',
                        text: 'Order Closed'
                    },
                    TRADE_FINISHED: {
                        color: 'purple',
                        text: 'Order Completed'
                    }
                }
                const color = status[data.trade_status].color || 'red'
                const text = status[data.trade_status].text || data.trade_status || 'Data Abnormal'
                return <Tag color={color}>{text}</Tag>
            }
        },
        {
            title: 'User Account',
            width: 180,
            dataIndex: 'user_id',
            render: (_, data) => {
                if (!data.user_id) return '-'
                return (
                    <p>{data.user?.account}</p>
                )
            }
        },
        {
            title: 'Payment Channel',
            dataIndex: 'channel',
            width: 120,
            render: (_, data) => (
                <a onClick={() => {
                    setIsModalOpen({
                        title: 'Payment Channel Information',
                        json: data.payment_info,
                        open: true
                    })
                }}
                >{data.channel}
                </a>

            )
        },
        {
            title: 'Payment Link',
            dataIndex: 'pay_url',
            ellipsis: true,
            render: (_, data) => <a href={data?.pay_url || ''} target="_blank" rel="noreferrer">{data.pay_url}</a>
        },
        {
            title: 'Additional Parameters',
            dataIndex: 'params',
            width: 100,
            render: (_, data) => (
                <a onClick={() => {
                    setIsModalOpen({
                        title: 'Additional Parameters',
                        json: data.params,
                        open: true
                    })
                }}
                >
                    Click to View
                </a>
            )
        },
        {
            title: 'IP',
            dataIndex: 'ip',
        },
        {
            title: 'Created At',
            dataIndex: 'create_time',
        },
        {
            title: 'Updated At',
            dataIndex: 'update_time',
        },
        // {
        //     title: 'Actions',
        //     width: 160,
        //     valueType: 'option',
        //     fixed: 'right',
        //     render: (_, data) => [
        //         <Button
        //             key="edit"
        //             type="link"
        //             onClick={() => {
        //                 setEditInfoModal(() => {
        //                     form?.setFieldsValue({
        //                         ...data
        //                     });
        //                     return {
        //                         open: true,
        //                         info: data
        //                     }
        //                 });
        //             }}
        //         >
        //             编辑
        //         </Button>,
        //         <Button
        //             key="del"
        //             type="text"
        //             danger
        //             onClick={() => {
        //                 delAdminProduct({
        //                     id: data.id
        //                 }).then((res) => {
        //                     if (res.code) return
        //                     message.success('删除成功')
        //                     tableActionRef.current?.reload()
        //                 })
        //             }}
        //         >
        //             删除
        //         </Button>
        //     ]
        // }
    ];

    function syntaxHighlight(json: string) {
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
            let cls = 'number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'key';
                } else {
                    cls = 'string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'boolean';
            } else if (/null/.test(match)) {
                cls = 'null';
            }
            return '<span class="' + cls + '">' + match + '</span>';
        });
    }

    return (
        <div>
            <ProTable
                actionRef={tableActionRef}
                columns={columns}
                scroll={{
                    x: 2000
                }}
                request={async (params, sorter, filter) => {
                    // Form search items will be passed from params to the backend API.
                    const res = await getAdminOrders({
                        page: params.current || 1,
                        page_size: params.pageSize || 10,
                    });
                    return Promise.resolve({
                        data: res.data.rows,
                        total: res.data.count,
                        success: true,
                    });
                }}
                toolbar={{
                    actions: []
                }}
                rowKey="id"
                search={false}
                bordered
            />

            <Modal
                title={isModalOpen.title}
                open={isModalOpen.open}
                onOk={() => {
                    setIsModalOpen(() => {
                        return {
                            title: '',
                            open: false,
                            json: ''
                        }
                    })
                }}
                onCancel={() => {
                    setIsModalOpen(() => {
                        return {
                            title: '',
                            open: false,
                            json: ''
                        }
                    })
                }}
            >
                {
                    isModalOpen.json && (
                        <pre className={styles.jsonPre} dangerouslySetInnerHTML={{
                            __html: syntaxHighlight(JSON.stringify(JSON.parse(isModalOpen.json), null, 4))
                        }}
                        />
                    )
                }
            </Modal>
        </div>
    )
}

export default OrderPage;
