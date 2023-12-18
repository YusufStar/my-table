import CustomTable from "@/components/CustomTable";
import {data} from "@/lib/data";
import {TestColumns, yourData} from "@/lib/table";

export default function Home() {
    return (
        <main className="min-h-screen p-12 flex items-center justify-center">
            <div className="container">
                <CustomTable
                    columns={TestColumns}
                    langs={["Tr", "En"]}
                    initial_dt={data}
                    perPage={10}
                    pagination={true}
                    paginationType="page"
                />
            </div>
        </main>
    )
}
