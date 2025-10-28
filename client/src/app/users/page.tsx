"use client";

import { useGetUsersQuery } from "@/state/api";
import Header from "@/app/(components)/Header";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

const columns: GridColDef[] = [
  { field: "userId", headerName: "ID", width: 70 },
  { field: "name", headerName: "Name", flex: 1, minWidth: 150 },
  { field: "email", headerName: "Email", flex: 1.2, minWidth: 200 },
  {
    field: "password",
    headerName: "Password",
    flex: 0.8,
    minWidth: 150,
    renderCell: () => <span className="text-gray-400">••••••••</span>,
  },
  { field: "role", headerName: "Role", flex: 0.8, minWidth: 120 },
];

const Users = () => {
  const { data: users, isError, isLoading } = useGetUsersQuery();

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  if (isError || !users) {
    return (
      <div className="text-center text-red-500 py-4">Failed to fetch users</div>
    );
  }

  return (
    <div className="mx-auto w-full pb-10">
      <div className="flex justify-between items-center mb-6">
        <Header name="Users" />
      </div>

      <div className="bg-white shadow rounded-xl border border-gray-200 p-4">
        <DataGrid
          rows={users}
          columns={columns}
          getRowId={(row) => row.userId}
          autoHeight
          checkboxSelection
          disableRowSelectionOnClick
          className="!text-gray-800"
        />
      </div>
    </div>
  );
};

export default Users;
