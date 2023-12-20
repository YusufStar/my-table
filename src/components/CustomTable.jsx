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
import {Checkbox} from "@/components/ui/checkbox";

const CustomTable = ({
                         columns,
                         initial_dt,
                         perPage = 10,
                         pagination = true,
                         paginationType = "page",
                         langs,
                         defaultLang
                     }) => {
    {/* Stateler */}
    const [data, setData] = useState(initial_dt);
    const [page, setPage] = useState({
        pageSize: perPage,
        pageIndex: 0,
    });
    const [filters, setFilters] = useState({
        global: "", /* Filtreleme inputunun değerini tutar */
        columns: [], /* Column filterlarının değerlerini tutar  */
    });
    const [visible,setVisible] = useState({}); {/* tablodaki başlıkların görünürlük değerlerini tutar, [key]: boolen */}
    const [openAddModal, setOpenAddModal] = useState(false); {/* Data ekleme modalının kapanıp açıldığının değerini tutar */}
    const [addModalState, setAddModalState] = useState({}); {/* Data ekleme modalının içerisine girilen değerlerin tutulduğu state */}
    const [sorting, setSorting] = useState({}); {/* [key]: "asc" | "desc, bu type'da bir veri alır keyi tabloda arar ve bulunan başlığı valuesundaki değere göre sıralar (asc veya desc) olarak. */}
    const [lang, setLang] = useState(langs.filter((x) => x.code.toLowerCase() === defaultLang.toLowerCase())[0] ?? null); {/* DefaultLang'deki stringi langs datası içerisindeki .code valuesunda arar ve bulunan dili state içerisine default oalrak verir, bu state dil değerini tutar */}
    const [addModalLang, setAddModalLang] = useState(null); {/* Lang ile aynı yapıda olup data ekleme modalında eklenecek dataların hangi dilde yazıldığını tutar */}
    const [selection, setSelection] = useState({}); {/* [key]: boolena, bu type'da bir veri tutar datanın indexini key olarak kullanır o index'e ait olan satırın seçili olup olmadığını bu state tutar. */}

    {/* if else yapıları */}
    const totalPages = useMemo(() => Math.ceil(data.length / perPage), [data, perPage]);
    const handlePrevious = () => setPage((prev) => ({...prev, pageIndex: prev.pageIndex - 1}));
    const handleNext = () => setPage((prev) => ({...prev, pageIndex: prev.pageIndex + 1}));
    const canNextPage = () => page.pageIndex === totalPages - 1;
    const canPreviousPage = () => page.pageIndex === 0;
    const isSelectedAll = () => table.getRows().length > 0 && table.getRows().every((row, index) => selection[index])

    {/* fonksiyonların çağrılması */}
    const table = TableFunctions({
        columns,
        visible,
        data,
        filters,
        pagination,
        page,
        sorting,
        isSelectedAll,
        setFilters,
        setSorting,
        setSelection
    });

    return (
        <div className=" h-full flex flex-col gap-4">
            <div className="flex flex-wrap items-center w-full gap-4">
                <Input
                    value={filters.global}
                    onChange={(e) => setFilters((prev) => ({...prev, global: e.target.value}))}
                    placeholder="Search in data table."
                    className="w-screen max-w-sm !outline-none !ring-muted-foreground"
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
                        {lang
                            ? <Button variant="outline">
                                <img alt={lang?.name} className="w-8" src={lang?.image}/>
                            </Button>
                            : <Button variant="outline">Deafult</Button>}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => setLang(null)}>Default</DropdownMenuItem>
                        {langs.map((lang, idx) => (
                            <DropdownMenuItem key={idx} onClick={() => setLang(lang)}>{lang.code}</DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                <ThemeToggle/>

                <AlertDialog>
                    <AlertDialogTrigger
                        disabled={data.length === 0}
                        className="ml-0 2xl:ml-auto disabled:pointer-events-none disabled:opacity-50"
                    >
                        <Button variant="outline">Delete Selected Row's</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>Delete selected rows</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => {
                                    const filteredData = data.filter((item, index) => !selection[index] ?? true);

                                    setData(filteredData);
                                    setSelection({})
                                    setFilters({global: "", columns: []});

                                    toast.warning("Deleted Selected Data");
                                }}
                            >
                                Continue
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* BU BLOCK TÜM FİLTERLANMIŞ DATAYI SİLMEK İÇİN VAR */}
                <AlertDialog>
                    <AlertDialogTrigger
                        disabled={data.length === 0}
                        className="disabled:pointer-events-none disabled:opacity-50"
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

                {/* BU BLOCK DATA EKLEME MODALINI İÇERİR */}
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
                                setAddModalLang(null)
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
                                    <DropdownMenuTrigger className="!ring-0 ml-auto" asChild>
                                        {addModalLang
                                            ? <Button variant="outline">
                                                <img alt={addModalLang?.name} className="w-8"
                                                     src={addModalLang?.image}/>
                                            </Button>
                                            : <Button variant="outline">Deafult</Button>}
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start">
                                        <DropdownMenuItem
                                            onClick={() => setAddModalLang(null)}>Default</DropdownMenuItem>
                                        {langs.map((lang, idx) => (
                                            <DropdownMenuItem key={idx}
                                                              onClick={() => setAddModalLang(lang)}>{lang.code}</DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* DATA EKLMEK İÇİN İNPUTLAR */}
                            <div className="flex flex-col gap-5 py-6">
                                {columns
                                    .filter((x) => x?.enableForm && (addModalLang === null || x?.translate))
                                    .map((column, col_index) => {
                                        const columnKey = addModalLang === null ? column?.dt_name : column?.dt_name + addModalLang?.code;

                                        return (
                                            <div
                                                className="grid gridcol-4 items-center gap-4"
                                                key={col_index + columnKey}
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
                                                    placeholder={(addModalLang ? addModalLang?.code + " " : "") + column?.dt_name?.replaceAll("_", " ")}
                                                />
                                            </div>
                                        );
                                    })}
                            </div>

                            <DialogFooter>
                                <DialogClose onClick={() => setAddModalState({})} className="mr-4">
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

                {filters.columns.length > 0 || sorting?.id ? (
                    <Button
                        onClick={() => {
                            setFilters((prevState) => ({...prevState, columns: []}))
                            setSorting({})
                        }}
                        variant="destructive"
                    >
                        Clear Filters
                    </Button>
                ) : null}
            </div>

            {/* TABLE MAİN BLOCK */}
            <div className="rounded border ">
                <Table>
                    {/* TABLE HEADER */}
                    <TableHeader>
                        <TableHead>
                            <Checkbox
                                checked={isSelectedAll()}
                                onCheckedChange={(val) => table.selectAll(val)}
                            />
                        </TableHead>
                        {table.getHeaders().map((column, idx) => (
                            <TableHead key={idx} className="!w-fit">
                                {column.columnFilter ? (
                                    <Select
                                        defaultValue="all"
                                        onValueChange={(newVal) => table.changeFilter(column.dt_name, newVal.toLowerCase())}
                                    >
                                        <SelectTrigger className="px-2 w-[125px] !ring-transparent capitalize">
                                            <SelectValue placeholder="All"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem defaultChecked={true} value="all">
                                                All
                                            </SelectItem>
                                                {table.uniqueValues(column.dt_name).map((val, idx) => (
                                                <SelectItem key={idx} value={val} className="capitalize">{val}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : column.sortable ? (
                                    <div
                                        onClick={() => table.changeSorting(column)}
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
                        {table.getRows().map((dt, dt_idx) => {
                            return (
                                <TableRow key={dt_idx}>
                                    <TableCell>
                                        <Checkbox
                                            checked={selection[dt_idx] ?? false}
                                            onCheckedChange={() => setSelection(prev => ({
                                                ...prev,
                                                [dt_idx]: !prev[dt_idx] ?? true
                                            }))}
                                        />
                                    </TableCell>
                                    {table.getHeaders().map((col, col_idx) => {
                                        const CustomComponent = col?.cell ?? null
                                        return (
                                            <TableCell key={col_idx}>{
                                                CustomComponent
                                                    ? <CustomComponent {...col} {...dt}/>
                                                    : dt[col.dt_name + lang?.code ?? ""] ?? dt[col.dt_name]
                                            }</TableCell>
                                        )
                                    })}
                                </TableRow>
                            )
                        })}
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
