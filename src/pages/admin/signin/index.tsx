import { getAdminSignin } from '@/request/adminApi';
import { SigninInfo } from '@/types/admin';
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Tag } from 'antd';
import { useRef} from 'react';

function SigninPage() {

    const tableActionRef = useRef<ActionType>();
    const columns: ProColumns<SigninInfo>[] = [
        {
            title: 'ID',
            dataIndex: 'id',
            width: 180,
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
            title: 'IP',
            dataIndex: 'ip',
            render: (_, data)=><Tag>{data.ip}</Tag>
        },
        {
            title: 'Status',
            dataIndex: 'status',
            render: (_, data) => <Tag color={data.status ? 'green' : 'red'}>{data.status ? 'Sign-in Successful' : 'Sign-in Failed'}</Tag>
        },
        {
            title: 'Created At',
            dataIndex: 'create_time',
        },
        {
            title: 'Updated At',
            dataIndex: 'update_time',
        },
    ];

    return (
        <div>
            <ProTable
                actionRef={tableActionRef}
                columns={columns}
                scroll={{
                    x: 1200
                }}
                request={async (params, sorter, filter) => {
                    // Form search items will be passed from params to the backend API.
                    const res = await getAdminSignin({
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
                    actions: [],
                }}
                rowKey="id"
                search={false}
                bordered
            />
        </div>
    )
}

export default SigninPage;