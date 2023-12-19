'use client'

import {useMemo, useState} from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {toast} from "react-toastify";
import {TableFunctions} from "@/lib/table";
import {
    AlertDialog,
    AlertDialogAction, AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog";
import ThemeToggle from "@/components/ThemeToggle";
import {Label} from "@/components/ui/label";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {ArrowDownIcon, ArrowDownUp, ArrowUpIcon} from "lucide-react";

const CustomTable = ({
                         columns,
                         initial_dt,
                         perPage = 10,
                         pagination = true,
                         paginationType = "page",
                         langs,
                     }) => {
    const [data, setData] = useState(initial_dt);
    const [page, setPage] = useState({
        pageSize: perPage,
        pageIndex: 0,
    });
    const [filters, setFilters] = useState({
        global: "",
        columns: [],
    });
    const [visible, setVisible] = useState({});
    const [openAddModal, setOpenAddModal] = useState(false);
    const [addModalState, setAddModalState] = useState({});
    const [sorting, setSorting] = useState({});
    const [lang, setLang] = useState(langs[0]);
    const [addModalLang, setAddModalLang] = useState(langs[0]);

    const table = TableFunctions({
        columns,
        visible,
        data,
        filters,
        pagination,
        page,
        sorting,
    });

    const totalPages = useMemo(() => Math.ceil(data.length / perPage), [data, perPage]);

    const handlePrevious = () => setPage((prev) => ({...prev, pageIndex: prev.pageIndex - 1}));
    const handleNext = () => setPage((prev) => ({pageSize: perPage, pageIndex: prev.pageIndex + 1}));
    const canNextPage = () => page.pageIndex === totalPages - 1;
    const canPreviousPage = () => page.pageIndex === 0;

    return (
        <div className="w-full h-full flex flex-col gap-4">
            <div className="flex items-center w-full gap-4">
                <Input
                    value={filters.global}
                    onChange={(e) => setFilters((prev) => ({...prev, global: e.target.value}))}
                    placeholder="Search in data table."
                    className="max-w-sm !outline-none !ring-muted-foreground"
                />

                <DropdownMenu>
                    <DropdownMenuTrigger className="">
                        <Button variant="outline" className="">
                            Columns
                            <ArrowDownIcon className="w-3.5 h-3.5 ml-2"/>
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="start">
                        {columns.filter((col) => !col.hide).map((column) => (
                            <DropdownMenuCheckboxItem
                                onCheckedChange={(value) => {
                                    setVisible((prev) => ({...prev, [column.dt_name]: value}));
                                }}
                                checked={visible[column.dt_name] ?? true}
                                key={column.dt_name}
                                className="capitalize"
                            >
                                {column.header}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger className="!ring-0" asChild>
                        <Button variant="outline">
                            <img alt={lang.name} className="w-8" src={lang?.image}/>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        {langs.map((lang) => (
                            <DropdownMenuItem onClick={() => setLang(lang)}>{lang.code}</DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                <ThemeToggle/>

                <AlertDialog>
                    <AlertDialogTrigger
                        disabled={data.length === 0}
                        className="ml-auto disabled:pointer-events-none disabled:opacity-50"
                    >
                        <Button variant="outline">Delete All</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>Delete all rows</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => {
                                    const filteredData = data.filter((item) => !table.applyFilters(item));

                                    setData(filteredData);
                                    setFilters({global: "", columns: []});

                                    toast.warning("Deleted All Data");
                                }}
                            >
                                Continue
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <Dialog open={openAddModal} onOpenChange={setOpenAddModal}>
                    <DialogTrigger asChild>
                        <Button variant="outline">Add Data</Button>
                    </DialogTrigger>

                    <DialogContent className={"lg:max-w-2xl overflow-y-auto h-fit"}>
                        <form
                            className="outline-none rounded-md"
                            onSubmit={(e) => {
                                e.preventDefault();
                                const st = addModalState;
                                setData((prevState) => [...prevState, {id: prevState.length + 1, ...st}]);
                                setAddModalLang(langs[0])
                                toast.success("Successfully added new data");
                                setAddModalState({});
                                setOpenAddModal(false);
                            }}
                        >
                            <div className="w-full flex items-start pr-8">
                                <DialogHeader>
                                    <DialogTitle>Add Data</DialogTitle>
                                    <DialogDescription>Click add when you're done.</DialogDescription>
                                </DialogHeader>

                                <DropdownMenu>
                                    <DropdownMenuTrigger className="!ring-0" asChild>
                                        <Button variant="outline" className="ml-auto">
                                            <img alt={addModalLang.name} className="w-8" src={addModalLang?.image}/>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        {langs.map((lang) => (
                                            <DropdownMenuItem onClick={() => setAddModalLang(lang)}>{lang.code}</DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <div className="flex flex-col gap-5 py-6">
                                {columns
                                    .filter((x) => x?.enableForm && (addModalLang?.code === langs[0].code || x?.translate))
                                    .map((column) => {
                                        const columnKey = addModalLang?.code === langs[0].code ? column?.dt_name : column?.dt_name + addModalLang?.code;

                                        return (
                                            <div
                                                className="grid gridcol-4 items-center gap-4"
                                                key={column.id + columnKey}
                                            >
                                                <Label className="text-left w-full capitalize">
                                                    {column?.dt_name?.replaceAll("_", " ")}
                                                </Label>
                                                <Input
                                                    onChange={(event) =>
                                                        setAddModalState((prevState) => ({
                                                            ...prevState,
                                                            [columnKey]: event.target.value,
                                                        }))
                                                    }
                                                    type={column?.type}
                                                    value={addModalState[columnKey]}
                                                    required
                                                    id={columnKey}
                                                    placeholder={(addModalLang?.code && addModalLang?.code + " ") + column?.dt_name?.replaceAll("_", " ")}
                                                />
                                            </div>
                                        );
                                    })}
                            </div>

                            <DialogFooter>
                                <DialogClose className="mr-4">
                                    <Button variant="secondary" type="reset">
                                        Close
                                    </Button>
                                </DialogClose>
                                <Button type="submit" variant="destructive">
                                    Add Data
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {filters.columns.length > 0 ? (
                    <Button
                        onClick={() => setFilters((prevState) => ({...prevState, columns: []}))}
                        variant="destructive"
                    >
                        Clear Filters
                    </Button>
                ) : null}
            </div>

            <div className="rounded border">
                <Table>
                    <TableHeader>
                        {table.getHeaders().map((column, idx) => (
                            <TableHead key={idx} className="!w-fit">
                                {column.columnFilter ? (
                                    <Select
                                        defaultValue="all"
                                        onValueChange={(newVal) => {
                                            setFilters((prevFilters) => {
                                                const updatedColumns = prevFilters.columns.filter(
                                                    (col) => Object.keys(col)[0] !== column.dt_name
                                                );

                                                const withoutAllFilter = updatedColumns.filter(
                                                    (col) => Object.values(col)[0] !== null
                                                );

                                                const newColumns =
                                                    newVal !== "all"
                                                        ? [...withoutAllFilter, {[column.dt_name]: newVal}]
                                                        : withoutAllFilter;

                                                return {
                                                    ...prevFilters,
                                                    columns: newColumns,
                                                };
                                            });
                                        }}
                                    >
                                        <SelectTrigger className="px-2 w-2/4 !ring-transparent">
                                            <SelectValue placeholder="All"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem  defaultChecked={true} value="all">
                                                All
                                            </SelectItem>
                                            {table.uniqueValues(column.dt_name).map((val) => (
                                                <SelectItem value={val}>{val}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : column.sortable ? (
                                    <div
                                        onClick={() => {
                                            if (column?.header !== sorting?.id) {
                                                setSorting({
                                                    id: column.header,
                                                    value: "asc",
                                                });
                                            } else if (column?.header === sorting?.id) {
                                                setSorting((prevState) => ({
                                                    ...prevState,
                                                    value: prevState?.value === "asc" ? "desc" : "asc",
                                                }));
                                            }
                                        }}
                                        className="w-fit border-b border-muted-foreground cursor-pointer flex items-center gap-2"
                                    >
                                        {column.header}
                                        {column.header !== sorting?.id && <ArrowDownUp className="w-4 h-4"/>}
                                        {column.header === sorting?.id ? (
                                            sorting?.value === "asc" ? (
                                                <ArrowDownIcon className="w-4 h-4"/>
                                            ) : (
                                                <ArrowUpIcon className="w-4 h-4"/>
                                            )
                                        ) : null}
                                    </div>
                                ) : (
                                    column.header
                                )}
                            </TableHead>
                        ))}
                    </TableHeader>

                    <TableBody>
                        {table.getRows().map((dt, dt_idx) => (
                            <TableRow key={dt_idx}>
                                {table.getHeaders().map((col, col_idx) => (
                                    <TableCell key={col_idx}>{dt[col.dt_name + lang.code] ?? dt[col.dt_name]}</TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {paginationType === "load" && (
                <Button
                    disabled={data.length <= (page.pageIndex + 1) * perPage}
                    onClick={() =>
                        setPage((prev) => ({
                            pageSize: prev.pageSize + perPage,
                            pageIndex: 0,
                        }))
                    }
                    variant="link"
                >
                    Load more...
                </Button>
            )}
            {paginationType === "page" && (
                <div className="mr-auto flex gap-3 items-center">
                    <Button
                        disabled={canPreviousPage()}
                        onClick={handlePrevious}
                        variant="outline"
                    >
                        Previous
                    </Button>

                    <Button
                        disabled={canNextPage()}
                        onClick={handleNext}
                        variant="outline"
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
};

export default CustomTable;
