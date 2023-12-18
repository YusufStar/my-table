import CustomTable from "@/components/CustomTable";
import {data} from "@/lib/data";

export default function Home() {
    return (
        <main className="min-h-screen p-12 flex items-center justify-center">
            <div className="container">
                <CustomTable
                    columns={
                        [
                            {
                                header: "id",
                                dt_name: "id",
                            },
                            {
                                header: "Email",
                                dt_name: "email",
                                filter: "include",
                                enableForm: true,
                                type: "email"
                            },
                            {
                                header: "First Name",
                                dt_name: "first_name",
                                filter: "include",
                                enableForm: true,
                                type: "text"
                            },
                            {
                                header: "Last Name",
                                dt_name: "last_name",
                                filter: "include",
                                enableForm: true,
                                type: "text"
                            },
                            {
                                header: "Gender",
                                dt_name: "gender",
                                filter: "equal",
                                columnFilter: true,
                                enableForm: true,
                                type: "text"
                            }
                        ]
                    }
                    initial_dt={data}
                    perPage={10}
                    pagination={true}
                    paginationType="load"
                />
            </div>
        </main>
    )
}
