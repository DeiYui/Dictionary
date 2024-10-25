"use client";
import { default as Learning } from "@/model/Learning";
import { RootState } from "@/store";
import { useQuery } from "@tanstack/react-query";
import { Input, Table, message, Modal, List, Avatar, Skeleton, Spin } from "antd";
import { FC, useCallback, useState, useEffect } from "react";
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

interface Topic {
  topicId?: number;
  content: string;
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

  const [showModal, setShowModal] = useState<{
    open: boolean;
    classRoomId: number;
  }>({
    open: false,
    classRoomId: 0,
  });

  const [searchTopicText, setSearchTopicText] = useState<string>("");
  const [filteredTopics, setFilteredTopics] = useState<Topic[]>([]);
  const [topicPrivates, setTopicPrivates] = useState<Topic[]>([]);

  const handleTableChange = (pagination: any) => {
    setCurrentPage(pagination.current);
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
      const sortedData = res.data.sort((a: Class, b: Class) =>
        a.content.localeCompare(b.content)
      );
      setLstClass(sortedData);
      setFilteredLstClass(sortedData);
      return sortedData as Class[];
    },
  });

  // API lấy danh sách topics
  const { data: allTopicsPublic, isFetching: isFetchingTopics } = useQuery({
    queryKey: ["getAllTopicsPublic", showModal.classRoomId],
    queryFn: async () => {
      const res = await Learning.getAllTopics({
        isPrivate: "false",
        classRoomId: showModal.classRoomId,
      });
      return res.data as Topic[];
    },
    enabled: showModal.open,
  });

  const { data: allTopicsPrivate, isFetching: isFetchingTopicsPrivate } = useQuery({
    queryKey: ["getAllTopicsPrivate", showModal.classRoomId],
    queryFn: async () => {
      const res = await Learning.getAllTopics({
        isPrivate: "true",
        classRoomId: showModal.classRoomId,
      });
      return res.data as Topic[];
    },
    enabled: showModal.open && user?.role !== "USER",
  });

  useEffect(() => {
    if (allTopicsPublic) {
      setFilteredTopics(
        allTopicsPublic.filter((topic) =>
          topic?.content?.toLowerCase().includes(searchTopicText.toLowerCase())
        )
      );
    }
    if (allTopicsPrivate) {
      setTopicPrivates(
        allTopicsPrivate.filter((topic) =>
          topic?.content?.toLowerCase().includes(searchTopicText.toLowerCase())
        )
      );
    } else {
      setTopicPrivates([]);
    }
  }, [searchTopicText, allTopicsPublic, allTopicsPrivate]);

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
      render: (value: string, record: Class) => (
        <div
          className="text-lg cursor-pointer text-blue-500"
          onClick={() => setShowModal({ open: true, classRoomId: record.classRoomId })}
        >
          {value}
        </div>
      ),
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
        onChange={handleTableChange}
      />

      {/* Modal for Topics */}
      <Modal
        width={1000}
        title="Danh sách chủ đề"
        open={showModal.open}
        centered
        footer={null}
        onCancel={() => setShowModal({ open: false, classRoomId: 0 })}
      >
        <Input
          size="large"
          placeholder="Nhập chủ đề muốn tìm kiếm"
          className="w-2/3"
          value={searchTopicText}
          onChange={(e) => setSearchTopicText(e.target.value)}
        />
        <div className="flex w-full gap-4">
          <div className="mt-2 flex-1 text-base font-bold">Chủ đề chung</div>
          {user && user?.role !== "USER" && (
            <div className="mt-2 w-1/2 text-base font-bold">Chủ đề riêng</div>
          )}
        </div>
        <div className="flex w-full items-center gap-4">
          <div className="flex-1">
            <List
              className="custom-scrollbar mt-4 max-h-[450px] overflow-y-auto pb-4"
              loading={isFetchingTopics}
              itemLayout="horizontal"
              dataSource={filteredTopics}
              bordered
              renderItem={(topic) => (
                <List.Item
                  key={topic.topicId}
                  className={`${showModal.classRoomId === topic.topicId ? "bg-green-200" : ""} hover:cursor-pointer hover:bg-neutral-300`}
                  onClick={() => setShowModal({ classRoomId: topic.topicId, open: false })}
                >
                  <Skeleton avatar title={false} loading={isFetchingTopics} active>
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          className="mt-1"
                          size={50}
                          src={topic?.imageLocation}
                        />
                      }
                      title={
                        <div className="mt-3 text-base font-semibold">
                          {topic?.content}
                        </div>
                      }
                    />
                  </Skeleton>
                </List.Item>
              )}
              locale={{ emptyText: "" }}
            />
          </div>
          {user && user.role !== "USER" && (
            <div className="w-1/2">
              <List
                className="custom-scrollbar mt-4 max-h-[450px] overflow-y-auto pb-4"
                loading={isFetchingTopicsPrivate}
                itemLayout="horizontal"
                dataSource={topicPrivates}
                bordered
                renderItem={(topic) => (
                  <List.Item
                    key={topic.topicId}
                    className={`${showModal.classRoomId === topic.topicId ? "bg-green-200" : ""} hover:cursor-pointer hover:bg-neutral-300`}
                    onClick={() => setShowModal({ classRoomId: topic.topicId, open: false })}
                  >
                    <Skeleton avatar title={false} loading={isFetchingTopicsPrivate} active>
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            className="mt-1"
                            size={50}
                            src={topic?.imageLocation}
                          />
                        }
                        title={
                          <div className="mt-3 text-base font-semibold">
                            {topic?.content}
                          </div>
                        }
                      />
                    </Skeleton>
                  </List.Item>
                )}
                locale={{ emptyText: "" }}
              />
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Rooms;