"use client";
import { CloseIcon } from "@/assets/icons";
import InputPrimary from "@/components/UI/Input/InputPrimary";
import BasicDrawer from "@/components/UI/draw/BasicDraw";
import Learning from "@/model/Learning";
import UploadModel from "@/model/UploadModel";
import { validateRequireInput } from "@/utils/validation/validtor";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Button,
  Form,
  Image,
  Input,
  Upload,
  UploadProps,
  message,
} from "antd";
import { useForm } from "antd/es/form/Form";
import React, { useCallback, useState } from "react";
import { CustomTable } from "../check-list/ExamList";
import { debounce } from "lodash";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

interface Class {
  classRoomId?: number;
  content: string;
  teacherName: string; // Add teacherName property
  imageLocation: string;
  videoLocation?: string;
}

const ClassList: React.FC = () => {
  const user: User = useSelector((state: RootState) => state.admin);

  const [form] = useForm(); // Ensure 'form' is used in your component
  const [lstClass, setLstClass] = useState([]);
  const [filteredLstClass, setFilteredLstClass] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const pageSize = 10;
  const [modalCreate, setModalCreate] = useState<{
    open: boolean;
    file: string;
    typeModal: string;
  }>({
    open: false,
    file: "",
    typeModal: "create",
  });

  const handleTableChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Fetching the list of teachers
  const { isFetching: isFetchingTeachers, data: teachersData } = useQuery({
    queryKey: ["getListTeachers"],
    queryFn: async () => {
      const res = await Learning.getListTeachers(); // New API call for teachers
      return res.data; // Assuming the response structure is { data: [...] }
    },
  });

  // API lấy danh sách lớp
  const { isFetching, refetch } = useQuery({
    queryKey: ["getListClass"],
    queryFn: async () => {
      const res = await Learning.getListClass();
      setLstClass(res.data); // Ensure 'teacherName' is included in res.data
      setFilteredLstClass(res.data);
      return res.data as Class[];
    },
  });

  // Thêm mới / chỉnh sửa lớp
  const mutationCreateUpdate = useMutation({
    mutationFn:
      modalCreate.typeModal === "create"
        ? Learning.createClass
        : Learning.editClass,
    onSuccess: (res) => {
      message.success(
        `${modalCreate.typeModal === "create" ? "Thêm mới lớp học thành công" : "Cập nhật lớp học thành công"}`,
      );
      refetch();
      setModalCreate({ ...modalCreate, open: false, file: "" });
    },
  });

  // Xoá lớp
  const mutationDel = useMutation({
    mutationFn: Learning.deleteClass,
    onSuccess: () => {
      message.success("Xoá lớp học thành công");
      refetch();
    },
  });

  // Upload file
  const uploadFileMutation = useMutation({
    mutationFn: UploadModel.uploadFile,
    onSuccess: async (res: any) => {
      form.setFieldValue("file", res);
      setModalCreate({ ...modalCreate, file: res });
    },
    onError: (error: Error) => {
      console.error(error);
      message.error("File đã được lưu trước đó");
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
      dataIndex: "teacherName", // Ensure this matches the data structure
      key: "teacherName",
      render: (value: string) => <div className="text-lg">{value}</div>,
      width: 300,
    },
    {
      title: "Mã lớp", // Column for "Mã lớp"
      dataIndex: "classRoomId", // Ensure this matches the data structure
      key: "classRoomId",
      render: (value: number) => <div className="text-lg">{value}</div>, // Render directly
      width: 200,
    },
    user?.role === "ADMIN"
      ? {
          title: "Hành động",
          key: "classRoomId",
          dataIndex: "classRoomId",
          render: (value: any, record: Class) => (
            <div className="flex space-x-2">
              <Button
                icon={<EditOutlined />}
                onClick={() => {
                  form.setFieldsValue({
                    content: record.content,
                    teacherName: record.teacherName, // Set teacherName for editing
                    file: record.imageLocation,
                    classRoomId: record.classRoomId,
                  });
                  setModalCreate({
                    ...modalCreate,
                    open: true,
                    file: record.imageLocation,
                    typeModal: "edit",
                  });
                }}
              />
              <Button
                icon={<DeleteOutlined />}
                danger
                onClick={() => mutationDel.mutate(value)}
              />
            </div>
          ),
        }
      : null,
  ]?.filter((item) => item);

  const props: UploadProps = {
    name: "file",
    onChange(info) {
      if (info.file.status === "done") {
        message.success(`${info.file.name} file uploaded successfully`);
      } else if (info.file.status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    customRequest: ({ file }: { file: any }) => {
      const formData = new FormData();
      formData.append("file", file);
      uploadFileMutation.mutate(formData);
    },
    progress: {
      strokeColor: {
        "0%": "#108ee9",
        "100%": "#87d068",
      },
      strokeWidth: 3,
      format: (percent) => percent && `${parseFloat(percent.toFixed(2))}%`,
    },
  };

  const handleSearch = useCallback(
    debounce((searchText: string) => {
      if (searchText) {
        setFilteredLstClass(
          lstClass.filter((item: any) =>
            (item?.content ?? "")
              .toLowerCase()
              .includes(searchText.toLowerCase()),
          ),
        );
      } else {
        setFilteredLstClass(lstClass);
      }
    }, 300),
    [lstClass],
  );

  const isLoading = isFetching || mutationCreateUpdate.isPending;

  return (
    <div className="w-full p-4">
      <h1 className="mb-4 text-2xl font-bold">Danh sách lớp học</h1>
      <div className="mb-4 flex items-center justify-between">
        <InputPrimary
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

        <Button
          hidden={!(user?.role === "ADMIN")}
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setModalCreate({ ...modalCreate, open: true, typeModal: "create" });
            form.resetFields();
          }}
        >
          Thêm mới
        </Button>
      </div>
      <CustomTable
        columns={columns as any}
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

      {/* Thêm lớp */}
      <BasicDrawer
        width={460}
        title={
          modalCreate.typeModal === "create"
            ? "Thêm mới lớp học"
            : "Chỉnh sửa lớp học"
        }
        onClose={() => {
          setModalCreate({ ...modalCreate, open: false, file: "" });
          form.resetFields();
        }}
        open={modalCreate.open}
        destroyOnClose
        onOk={() => {
          form.submit();
        }}
        maskClosable={false}
        extra={
          <div className="flex items-center gap-x-4">
            <Button
              className="hover:opacity-60 "
              onClick={() => {
                setModalCreate({ ...modalCreate, open: false, file: "" });
                form.resetFields();
              }}
              type="link"
              style={{ padding: 0 }}
            >
              <CloseIcon size={20} />
            </Button>
          </div>
        }
      >
        <div className="">
          <Form
            form={form}
            layout="vertical"
            onFinish={(value) => {
              // Ensure you are using the value directly from the form
              mutationCreateUpdate.mutate({
                content: value.content,
                teacherName: value.teacherName, // Include teacherName
                classRoomId: value.classRoomId, // Use the value directly from the form
                imageLocation: value.file,
              });
            }}
          >
            <Form.Item
              name="classRoomId"
              label="Mã lớp"
              className="mb-2"
              required
              rules={[
                { required: true, message: "Mã lớp không được bỏ trống" },
                { type: 'number', min: 1, message: "Mã lớp phải lớn hơn 0" }
              ]}
            >
              <Input 
                placeholder="Nhập mã lớp" 
                type="number" 
                min={1} 
                onKeyPress={(e) => {
                  // Prevent non-numeric input
                  if (!/[0-9]/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
              />
            </Form.Item>
            <Form.Item
              name="content"
              label="Tên lớp học"
              className="mb-2"
              required
              rules={[validateRequireInput("Tên lớp học không được bỏ trống")]}
            >
              <Input placeholder="Nhập tên lớp học muốn thêm" />
            </Form.Item>
            <Form.Item
              name="teacherName" // Change to teacherName
              label="Tên giáo viên"
              className="mb-2"
              required
              rules={[validateRequireInput("Tên giáo viên không được bỏ trống")]}
            >
              <Input placeholder="Nhập tên giáo viên" />
            </Form.Item>
            <Form.Item name="file" label="Ảnh">
              <Upload {...props} showUploadList={false}>
                <Button icon={<UploadOutlined />}>Tải ảnh lên</Button>
              </Upload>
            </Form.Item>
            <div className="flex w-full items-center justify-center">
              {modalCreate.file ? (
                <Image
                  className=""
                  src={modalCreate.file}
                  alt="Ảnh chủ đề"
                  style={{ width: 300 }}
                />
              ) : null}
            </div>
          </Form>
        </div>
      </BasicDrawer>
    </div>
  );
};

export default ClassList;
