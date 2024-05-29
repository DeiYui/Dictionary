"use client";
import { colors } from "@/assets/colors";
import Learning from "@/model/Learning";
import {
  DeleteFilled,
  DeleteOutlined,
  EditFilled,
  MenuFoldOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Button, Dropdown, Input, Select, Table } from "antd";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import styled from "styled-components";

interface Exam {
  key: string;
  name: string;
  questionCount: number;
  status: number;
}

interface FilterParams {
  page: number;
  size: number;
  topicId: number;
  status: number;
}

const exams: Exam[] = [
  { key: "1", name: "Bài kiểm tra 1", questionCount: 10, status: 1 },
  { key: "2", name: "Bài kiểm tra 2", questionCount: 15, status: 0 },
];

const optionStatus = [
  {
    label: "Đã hoàn thành",
    value: 1,
  },
  {
    label: "Chưa hoàn thành",
    value: 0,
  },
  {
    label: "Tất cả",
    value: -1,
  },
];

const ExamListPage: React.FC = () => {
  const router = useRouter();

  const [filterParams, setFilterParams] = useState<FilterParams>({
    page: 1,
    size: 999999,
    topicId: 0,
    status: -1,
  });
  // xử lý khi hover vào row
  const [hoveredRow, setHoveredRow] = useState("");

  // API lấy danh sách  topics
  const { data: allTopics } = useQuery({
    queryKey: ["getAllTopics"],
    queryFn: async () => {
      const res = await Learning.getAllTopics();
      return res?.data?.map((item: { topicId: any; content: any }) => ({
        id: item.topicId,
        value: item.topicId,
        label: item.content,
        text: item.content,
      }));
    },
  });

  const columns = [
    { title: "STT", dataIndex: "key", key: "key", width: 60 },
    {
      title: "Tên bài kiểm tra",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: Exam) => (
        <div onClick={() => router.push(`/exam/${record.key}`)}>
          <a className="text-blue-500">{text}</a>
        </div>
      ),
    },
    { title: "Số câu hỏi", dataIndex: "questionCount", key: "questionCount" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: number) =>
        status === 1 ? (
          <div className="caption-12-medium flex w-[120px] items-center justify-center rounded bg-green-100 px-3 py-2 text-green-700">
            Đã hoàn thành
          </div>
        ) : (
          <div className="caption-12-medium flex w-[128px] items-center justify-center rounded bg-neutral-200 px-3 py-2 text-neutral-700">
            Chưa hoàn thành
          </div>
        ),
    },
    {
      fixed: "right",
      dataIndex: "key",
      width: "40px",
      align: "center",
      render: (_: string, record: any) => {
        const items = [
          {
            key: "1",
            label: (
              <div className="flex items-center gap-x-3 py-[3px]">
                <EditFilled />
                Chỉnh sửa
              </div>
            ),
          },
          {
            key: "2",
            label: (
              <div className="text-red600 flex items-center gap-x-3 py-[3px]">
                <DeleteOutlined color={colors.red600} />
                Xóa
              </div>
            ),
          },
        ];
        return (
          <Dropdown menu={{ items }}>
            <div className="flex w-5 items-center justify-center">
              <div className="hidden-table-action" key={record.attributeId}>
                <MoreOutlined />
              </div>
            </div>
          </Dropdown>
        );
      },
    },
  ];

  // hover row
  const handleRowHover = (record: any) => {
    setHoveredRow(record.key);
  };
  const handleRowLeave = () => {
    setHoveredRow("");
  };

  return (
    <div className="container mx-auto py-4">
      <h1 className="mb-4 text-2xl font-bold">Danh sách bài kiểm tra</h1>
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Input className="w-full" placeholder="Tên bài kiểm tra" />
        <Select
          className="w-full"
          allowClear
          placeholder="Chủ đề"
          options={allTopics}
          onChange={(value, option: any) =>
            setFilterParams({ ...filterParams, topicId: value })
          }
        />

        <Select
          className="w-full"
          allowClear
          placeholder="Trạng thái"
          options={optionStatus}
          onChange={(e) => setFilterParams({ ...filterParams, status: e })}
        />
      </div>
      <div className="mb-3 flex justify-end">
        <Button type="primary">Thêm mới</Button>
      </div>
      <CustomTable
        dataSource={exams}
        columns={columns as any}
        scroll={{ x: 1100, y: 440 }}
        onRow={(record) => ({
          onMouseEnter: () => handleRowHover(record),
          onMouseLeave: () => handleRowLeave(),
        })}
        rowKey="key"
      />
    </div>
  );
};

export default ExamListPage;

export const CustomTable = styled(Table)`
  .ant-table-tbody {
    padding: 10px 16px 10px 16px;
  }
  .ant-table-tbody > tr > td {
    padding: 10px 16px 10px 16px;
  }
  .ant-table-cell.ant-table-cell-with-append {
    display: flex;
    padding-left: 0;
  }

  .ant-table-tbody > tr:hover {
    background-color: #f6f7f9;
  }

  .ant-table-thead .ant-table-cell {
    background-color: ${colors.neutral200};
    color: ${colors.neutral800};
    font-size: 12px;
    font-style: normal;
    font-weight: 600;
    line-height: 16px;
    letter-spacing: 0.09px;
  }
  .ant-table-row {
    color: ${colors.neutral1100};
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 20px;
    letter-spacing: 0.07px;
  }

  /* Hover */
  .ant-table-wrapper .ant-table-tbody > tr.ant-table-row:hover > th,
  .ant-table-wrapper .ant-table-tbody > tr.ant-table-row:hover > td,
  .ant-table-wrapper .ant-table-tbody > tr > th.ant-table-cell-row-hover,
  .ant-table-wrapper .ant-table-tbody > tr > td.ant-table-cell-row-hover {
    background: ${colors.neutral100};
  }

  /* panigation */
  .ant-pagination.ant-table-pagination.ant-table-pagination-right {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .ant-pagination-item {
    width: 32px;
    height: 32px;
    border-color: white;
    border-radius: 50%;
    color: ${colors.neutral1100} !important;
  }
  .ant-pagination-item.ant-pagination-item-active {
    background-color: ${colors.neutral200} !important;
  }
  .ant-pagination .ant-pagination-item-active:hover {
    border-color: ${colors.neutral200} !important;
  }
  .ant-pagination .ant-pagination-item-active a {
    color: ${colors.neutral1100} !important;
    text-align: center;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    letter-spacing: 0.07px;
  }

  .ant-table-body {
    scrollbar-width: auto;
    scrollbar-color: auto;
  }

  // custom scrollbar
  .ant-table-body::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }

  .ant-table-body::-webkit-scrollbar-track {
    background-color: transparent;
  }

  .ant-table-body::-webkit-scrollbar-thumb {
    border-radius: 6px;
    background-color: #babac0;
  }
`;