import CustomTable from "@/components/CustomTable";
import {data, langs} from "@/lib/data";
import {TestColumns, yourData} from "@/lib/table";

export default function Home() {
    return (
        <main className="min-h-screen p-8 w-screen flex items-center justify-center">
            <div className="container">
                <CustomTable
                    columns={TestColumns}
                    langs={langs}
                    initial_dt={data}
                    perPage={10}
                    pagination={true}
                    paginationType="page"
                />
            </div>
        </main>
    )
}
