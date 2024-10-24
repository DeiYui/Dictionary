"use client";
import { default as Learning } from "@/model/Learning";
import { RootState } from "@/store";
import { useQuery } from "@tanstack/react-query";
import { Input, Table, message } from "antd";
import { FC, useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { debounce } from "lodash";

export interface SectionHero2Props {
  className?: string;
}

interface Class {
  classRoomId?: number;
  content: string;
  teacherName: string;
  imageLocation: string;
  videoLocation?: string;
}

const Rooms: FC<SectionHero2Props> = ({ className = "" }) => {
  const user: User = useSelector((state: RootState) => state.admin);

  const [lstClass, setLstClass] = useState<Class[]>([]);
  const [filteredLstClass, setFilteredLstClass] = useState<Class[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const pageSize = 10;

  const handleTableChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // API lấy danh sách lớp
  const { isFetching, refetch } = useQuery({
    queryKey: ["getListClass"],
    queryFn: async () => {
      const res = await Learning.getListClass();
      if (!res.data?.length) {
        message.warning("Không có lớp học nào");
        return [];
      }
      setLstClass(res.data);
      setFilteredLstClass(res.data);
      return res.data as Class[];
    },
  });

  const columns = [
    {
      title: "STT",
      key: "index",
      render: (_: any, __: any, index: number) =>
        (currentPage - 1) * pageSize + index + 1,
      width: 50,
    },
    {
      title: "Tên lớp học",
      dataIndex: "content",
      key: "content",
      render: (value: string) => <div className="text-lg">{value}</div>,
      width: 200,
    },
    {
      title: "Tên giáo viên",
      dataIndex: "teacherName",
      key: "teacherName",
      render: (value: string) => <div className="text-lg">{value}</div>,
      width: 300,
    },
    {
      title: "Mã lớp",
      dataIndex: "classRoomId",
      key: "classRoomId",
      render: (value: number) => <div className="text-lg">{value}</div>,
      width: 200,
    },
  ];

  const handleSearch = useCallback(
    debounce((searchText: string) => {
      if (searchText) {
        setFilteredLstClass(
          lstClass.filter((item) =>
            item.content.toLowerCase().includes(searchText.toLowerCase())
          )
        );
      } else {
        setFilteredLstClass(lstClass);
      }
    }, 300),
    [lstClass]
  );

  const isLoading = isFetching;

  return (
    <div className={`w-full p-4 ${className}`}>
      <h1 className="mb-4 text-2xl font-bold">Danh sách lớp học</h1>
      <div className="mb-4 flex items-center justify-between">
        <Input
          allowClear
          onClear={() => {
            refetch();
            setCurrentPage(1);
            setSearchText("");
          }}
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            handleSearch(e.target.value);
          }}
          className="mb-4"
          style={{ width: 400 }}
          placeholder="Tìm kiếm tên lớp học"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch(e.currentTarget.value);
            }
          }}
        />
      </div>
      <Table
        columns={columns}
        dataSource={filteredLstClass}
        loading={isLoading}
        pagination={{
          pageSize: pageSize,
          current: currentPage,
          onChange: handleTableChange,
          showSizeChanger: false,
          position: ["bottomCenter"],
        }}
      />
    </div>
  );
};

export default Rooms;