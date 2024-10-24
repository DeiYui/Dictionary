"use client";
import { SearchIcon } from "@/assets/icons";
import StudyComponent from "@/components/Study/StudyComponent";
import InputPrimary from "@/components/UI/Input/InputPrimary";
import Learning from "@/model/Learning";
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  FileAddFilled,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { RootState } from "@/store";
import { useQuery } from "@tanstack/react-query";
import { Spin, message, Table, Select, Input, Image, Modal } from "antd";
import { FC, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { debounce } from "lodash";

export interface SectionHero2Props {
  className?: string;
}

const Vocabulary: FC<SectionHero2Props> = ({ className = "" }) => {
  const user: User = useSelector((state: RootState) => state.admin);

  //value search
  const [filterParams, setFilerParams] = useState<{
    topicId?: number;
    isPrivate?: boolean;
    vocabularyType?: string;
    contentSearch?: string;
  }>({});

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [modalPreview, setModalPreview] = useState<{
    open: boolean;
    file: string;
    type: "image" | "video";
  }>({
    open: false,
    file: "",
    type: "image",
  });

  const handleTableChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // API lấy danh sách topics
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

  // API lấy danh sách từ khi tìm kiếm
  const { data: allVocabulary, isFetching, refetch } = useQuery({
    queryKey: ["searchVocabulary", filterParams],
    queryFn: async () => {
      const res = await Learning.getAllVocabulary({
        ...filterParams,
        isPrivate: user.role === "USER" && "false",
      });
      if (!res?.data?.length) {
        message.warning("Không có kết quả tìm kiếm");
        return [];
      }
      // Sắp xếp priamry lên đầu
      res?.data?.forEach(
        (item: {
          vocabularyImageResList: any[];
          vocabularyVideoResList: any[];
        }) => {
          item.vocabularyImageResList?.sort(
            (a: { primary: any }, b: { primary: any }) => {
              // Sắp xếp sao cho phần tử có primary = true được đặt lên đầu
              return a.primary === b.primary ? 0 : a.primary ? -1 : 1;
            },
          );
          item.vocabularyVideoResList?.sort(
            (a: { primary: any }, b: { primary: any }) => {
              // Sắp xếp sao cho phần tử có primary = true được đặt lên đầu
              return a.primary === b.primary ? 0 : a.primary ? -1 : 1;
            },
          );
        },
      );
      return res.data;
    },
  });

  const columns = [
    {
      title: "Từ vựng",
      dataIndex: "content",
      key: "content",
      render: (content: any, record: any) => (
        <span
          className="w-[200px] cursor-pointer truncate "
          style={{
            fontWeight: 500,
            color: "#1890ff",
            maxWidth: "200px",
          }}
        >
          {content}
        </span>
      ),
      ellipsis: true,
      width: 200,
    },
    {
      title: "Chủ đề",
      dataIndex: "topicContent",
      key: "topicContent",
      render: (content: string) => (
        <span style={{ fontWeight: 500 }}>{content}</span>
      ),
      ellipsis: true,
      width: 100,
    },
    {
      title: "Loại từ vựng",
      dataIndex: "vocabularyType",
      key: "vocabularyType",
      render: (content: string) => (
        <span style={{ fontWeight: 500 }}>
          {content === "WORD"
            ? "Từ"
            : content === "SENTENCE"
            ? "Câu"
            : content === "PARAGRAPH"
            ? "Đoạn"
            : content}
        </span>
      ),
      ellipsis: true,
      width: 100,
    },
    {
      title: "Ảnh minh hoạ",
      dataIndex: "imageLocation",
      key: "imageLocation",
      align: "center",
      render: (
        imageLocation: any,
        record: {
          vocabularyImageResList: string | any[];
          content: string | undefined;
        },
      ) => {
        if (
          record.vocabularyImageResList?.length &&
          record.vocabularyImageResList[0].imageLocation
        ) {
          return (
            <EyeOutlined
              style={{ fontSize: "1.5rem" }}
              onClick={() =>
                setModalPreview({
                  open: true,
                  file: record.vocabularyImageResList[0].imageLocation,
                  type: "image",
                })
              }
            />
          );
        } else {
          return <span>Không có minh họa</span>;
        }
      },
      width: 120,
    },
    {
      title: "Video minh hoạ",
      dataIndex: "videoLocation",
      key: "videoLocation",
      align: "center",
      render: (
        videoLocation: any,
        record: { vocabularyVideoResList: string | any[] },
      ) => {
        if (
          record.vocabularyVideoResList?.length &&
          record.vocabularyVideoResList[0].videoLocation
        ) {
          return (
            <EyeOutlined
              style={{ fontSize: "1.5rem" }}
              onClick={() =>
                setModalPreview({
                  open: true,
                  file: record.vocabularyVideoResList[0].videoLocation,
                  type: "video",
                })
              }
            />
          );
        } else {
          return <span>Không video có minh họa</span>;
        }
      },
      width: 200,
    },
  ];

  const handleSearch = useCallback(
    debounce((searchText: string) => {
      setFilerParams({ ...filterParams, contentSearch: searchText });
    }, 300),
    [filterParams],
  );

  const isLoading = isFetching;

  return (
    <Spin spinning={isLoading}>
      <h1 className="mb-4 text-2xl font-bold">Danh sách từ điển học liệu</h1>
      <div className="flex w-full gap-4 mb-4">
        <Select
          placeholder="Chọn chủ đề"
          style={{ width: 200 }}
          options={allTopics}
          onChange={(value) => setFilerParams({ ...filterParams, topicId: value })}
        />
        <Select
          placeholder="Loại từ vựng"
          style={{ width: 200 }}
          onChange={(value) => setFilerParams({ ...filterParams, vocabularyType: value })}
        >
          <Select.Option value="WORD">Từ</Select.Option>
          <Select.Option value="SENTENCE">Câu</Select.Option>
          <Select.Option value="PARAGRAPH">Đoạn</Select.Option>
        </Select>
        <Input
          placeholder="Nhập từ vựng"
          style={{ width: 400 }}
          value={filterParams?.contentSearch}
          onChange={(e) => {
            setFilerParams({
              ...filterParams,
              contentSearch: e.target.value,
            });
            handleSearch(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setFilerParams({
                ...filterParams,
                contentSearch: e.currentTarget.value,
              });
              handleSearch(e.currentTarget.value);
            }
          }}
          suffix={<SearchIcon size={24} />}
        />
      </div>

      <Table
        columns={columns}
        dataSource={allVocabulary}
        loading={isLoading}
        pagination={{
          pageSize: pageSize,
          current: currentPage,
          onChange: handleTableChange,
          showSizeChanger: false,
          position: ["bottomCenter"],
        }}
      />

      <Modal
        visible={modalPreview.open}
        footer={null}
        onCancel={() => setModalPreview({ open: false, file: "", type: "image" })}
      >
        {modalPreview.type === "image" ? (
          <Image width="100%" src={modalPreview.file} />
        ) : (
          <video width="100%" controls>
            <source src={modalPreview.file} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}
      </Modal>
    </Spin>
  );
};

export default Vocabulary;


// "use client";
// import { SearchIcon } from "@/assets/icons";
// import StudyComponent from "@/components/Study/StudyComponent";
// import InputPrimary from "@/components/UI/Input/InputPrimary";
// import Learning from "@/model/Learning";
// import { RootState } from "@/store";
// import { useQuery } from "@tanstack/react-query";
// import { Spin, message } from "antd";
// import { FC, useState } from "react";
// import { useSelector } from "react-redux";

// export interface SectionHero2Props {
//   className?: string;
// }

// const Vocabulary: FC<SectionHero2Props> = ({ className = "" }) => {
//   const user: User = useSelector((state: RootState) => state.admin);

//   //value search
//   const [filterParams, setFilerParams] = useState<{
//     topicId?: number;
//     isPrivate?: boolean;
//     vocabularyType?: string;
//     contentSearch?: string;
//   }>({});

//   // API lấy danh sách từ khi tìm kiếm
//   const { data: allVocabulary, isFetching } = useQuery({
//     queryKey: ["searchVocabulary", filterParams],
//     queryFn: async () => {
//       const res = await Learning.getAllVocabulary({
//         ...filterParams,
//         vocabularyType: "WORD",
//         isPrivate: user.role === "USER" && "false",
//       });
//       if (!res?.data?.length) {
//         message.warning("Không có kết quả tìm kiếm");
//         return;
//       }
//       // Sắp xếp priamry lên đầu
//       res?.data?.forEach(
//         (item: {
//           vocabularyImageResList: any[];
//           vocabularyVideoResList: any[];
//         }) => {
//           item.vocabularyImageResList?.sort(
//             (a: { primary: any }, b: { primary: any }) => {
//               // Sắp xếp sao cho phần tử có primary = true được đặt lên đầu
//               return a.primary === b.primary ? 0 : a.primary ? -1 : 1;
//             },
//           );
//           item.vocabularyVideoResList?.sort(
//             (a: { primary: any }, b: { primary: any }) => {
//               // Sắp xếp sao cho phần tử có primary = true được đặt lên đầu
//               return a.primary === b.primary ? 0 : a.primary ? -1 : 1;
//             },
//           );
//         },
//       );
//       return (res.data as Vocabulary[]) || [];
//     },
//   });

//   return (
//     <Spin spinning={isFetching}>
//       <div className="flex w-full gap-4">
//         <InputPrimary
//           allowClear
//           className="relative mb-4"
//           style={{ width: 400 }}
//           placeholder="Tìm kiếm từ vựng"
//           value={filterParams?.contentSearch}
//           onChange={(e) => {
//             setFilerParams({
//               ...filterParams,
//               contentSearch: e.target.value,
//             });
//           }}
//           onKeyDown={(e) => {
//             if (e.key === "Enter") {
//               setFilerParams({
//                 ...filterParams,
//                 contentSearch: e.currentTarget.value,
//               });
//             }
//           }}
//           suffixIcon={<SearchIcon size={24} />}
//           onSuffixClick={(value) => {
//             setFilerParams({ ...filterParams, contentSearch: value });
//           }}
//           onClear={() => {
//             setFilerParams({ ...filterParams, contentSearch: "" });
//           }}
//         />
//       </div>

//       <StudyComponent allVocabulary={allVocabulary} />
//     </Spin>
//   );
// };

// export default Vocabulary;