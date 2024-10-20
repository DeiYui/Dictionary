"use client";
import StudyComponent from "@/components/Study/StudyComponent";
import ButtonSecondary from "@/components/UI/Button/ButtonSecondary";
import { default as Learning } from "@/model/Learning";
import { RootState } from "@/store";
import { useQuery } from "@tanstack/react-query";
import { Avatar, Input, List, Modal, Skeleton, Spin } from "antd";
import { useSearchParams } from "next/navigation";
import { FC, useEffect, useState } from "react";
import { useSelector } from "react-redux";

// Import or define these types
import { User, Topic, Vocabulary } from "@/types";

export interface SectionHero2Props {
  className?: string;
}

const Topics: FC<SectionHero2Props> = ({ className = "" }) => {
  const searchParams = useSearchParams();
  const topicId = Number(searchParams.get("topicId"));
  const user: User | null = useSelector((state: RootState) => state.admin);

  const [showModal, setShowModal] = useState<{
    open: boolean;
    topicId: number;
  }>({
    open: false,
    topicId: 0,
  });

  const [searchText, setSearchText] = useState<string>("");
  const [filteredTopics, setFilteredTopics] = useState<Topic[]>([]);
  const [topicPrivates, setTopicPrivates] = useState<Topic[]>([]);

  const token = localStorage.getItem("access_token");

  // API lấy danh sách topics
  const { data: allTopicsPublic, isFetching } = useQuery({
    queryKey: ["getAllTopics"],
    queryFn: async () => {
      const res = await Learning.getAllTopics({
        isPrivate: "false",
      });
      return res.data as Topic[];
    },
    enabled: showModal.open,
  });

  const { data: allTopicsPrivate, isFetching: isFetchingPrivate } = useQuery({
    queryKey: ["getAllTopicsPrivate"],
    queryFn: async () => {
      const res = await Learning.getAllTopics({
        isPrivate: "true",
      });

      return res.data as Topic[];
    },
    enabled: showModal.open && user?.role !== "USER",
  });

  // API lấy danh sách từ theo topics
  const { data: allVocabulary, isFetching: isFetchingVocabulary } = useQuery({
    queryKey: ["getVocabularyTopic", showModal.topicId],
    queryFn: async () => {
      const res = await Learning.getVocabularyTopic(showModal.topicId);
      return (res?.data as Vocabulary[]) || [];
    },
    enabled: !!showModal.topicId,
  });

  useEffect(() => {
    if (topicId) {
      setShowModal({ open: false, topicId });
    }
  }, [topicId]);

  // Tìm kiếm
  useEffect(() => {
    if (allTopicsPublic) {
      setFilteredTopics(
        allTopicsPublic.filter((topic) =>
          topic?.content?.toLowerCase().includes(searchText.toLowerCase()),
        ),
      );
    }
    if (allTopicsPrivate) {
      setTopicPrivates(
        allTopicsPrivate.filter((topic) =>
          topic?.content?.toLowerCase().includes(searchText.toLowerCase()),
        ),
      );
    }
  }, [searchText, allTopicsPublic, allTopicsPrivate]);

  return (
    <Spin spinning={isFetchingVocabulary}>
      <ButtonSecondary
        className="mb-4 border border-solid border-neutral-700"
        onClick={() => setShowModal({ ...showModal, open: true })}
      >
        Lựa chọn chủ đề
      </ButtonSecondary>
      <StudyComponent allVocabulary={allVocabulary} />

      {/* Modal */}
      <Modal
        width={1000}
        title="Danh sách chủ đề"
        open={showModal.open}
        centered
        footer={null}
        onCancel={() => setShowModal({ ...showModal, open: false })}
      >
        <Input
          size="large"
          placeholder="Nhập chủ đề muốn tìm kiếm"
          className="w-2/3"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <div className="flex w-full gap-4">
          <div className="mt-2  flex-1 text-base font-bold">Chủ đề chung</div>
          {user && user?.role !== "USER" && (
            <div className="mt-2 w-1/2 text-base font-bold ">Chủ đề riêng</div>
          )}
        </div>
        <div className="flex w-full items-center gap-4">
          <div className="flex-1">
            <List
              className="custom-scrollbar mt-4 max-h-[450px] overflow-y-auto pb-4"
              loading={isFetching}
              itemLayout="horizontal"
              dataSource={filteredTopics}
              bordered
              renderItem={(topic) => (
                <List.Item
                  key={topic.topicId}
                  className={`${showModal.topicId === topic.topicId ? "bg-green-200" : ""} hover:cursor-pointer hover:bg-neutral-300`}
                  onClick={() => {
                    setShowModal({ topicId: topic.topicId, open: false });
                  }}
                >
                  <Skeleton avatar title={false} loading={isFetching} active>
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
              locale={{ emptyText: "Không có kết quả tìm kiếm" }}
            />
          </div>
          {user && user.role !== "USER" && (
            <div className="w-1/2">
              <List
                className="custom-scrollbar mt-4 max-h-[450px] overflow-y-auto pb-4"
                loading={isFetchingPrivate}
                itemLayout="horizontal"
                dataSource={topicPrivates}
                bordered
                renderItem={(topic) => (
                  <List.Item
                    key={topic.topicId}
                    className={`${showModal.topicId === topic.topicId ? "bg-green-200" : ""} hover:cursor-pointer hover:bg-neutral-300`}
                    onClick={() => {
                      setShowModal({ topicId: topic.topicId, open: false });
                    }}
                  >
                    <Skeleton
                      avatar
                      title={false}
                      loading={isFetchingPrivate}
                      active
                    >
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
                locale={{ emptyText: "Không có kết quả tìm kiếm" }}
              />
            </div>
          )}
        </div>
      </Modal>
    </Spin>
  );
};

export default Topics;
