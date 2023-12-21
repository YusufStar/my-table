'use client'

import {useMemo, useState} from "react";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {toast} from "react-toastify";
import {TableFunctions} from "@/lib/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose,
} from "@/components/ui/dialog";
import ThemeToggle from "@/components/ThemeToggle";
import {Label} from "@/components/ui/label";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {ArrowDownIcon, ArrowDownUp, ArrowUpIcon} from "lucide-react";
import {Checkbox} from "@/components/ui/checkbox";

const CustomTable = ({
                         columns,
                         initial_dt,
                         perPage = 10,
                         paginationType = "page",
                         pagination = true,
                         langs,
                         defaultLang
                     }) => {
    {/* Stateler */
    }
    const [data, setData] = useState(initial_dt);
    const [page, setPage] = useState({
        pageSize: perPage, pageIndex: 0,
    });
    const [filters, setFilters] = useState({
        global: "", /* Filtreleme inputunun değerini tutar */
        columns: [], /* Column filterlarının değerlerini tutar  */
    });
    const [visible, setVisible] = useState({});
    {/* tablodaki başlıkların görünürlük değerlerini tutar, [key]: boolen */
    }
    const [openAddModal, setOpenAddModal] = useState(false);
    {/* Data ekleme modalının kapanıp açıldığının değerini tutar */
    }
    const [addModalState, setAddModalState] = useState({});
    {/* Data ekleme modalının içerisine girilen değerlerin tutulduğu state */
    }
    const [sorting, setSorting] = useState({});
    {/* [key]: "asc" | "desc, bu type'da bir veri alır keyi tabloda arar ve bulunan başlığı valuesundaki değere göre sıralar (asc veya desc) olarak. */
    }
    const [lang, setLang] = useState(langs.filter((x) => x.code.toLowerCase() === defaultLang.toLowerCase())[0] ?? null);
    {/* DefaultLang'deki stringi langs datası içerisindeki .code valuesunda arar ve bulunan dili state içerisine default oalrak verir, bu state dil değerini tutar */
    }
    const [addModalLang, setAddModalLang] = useState(null);
    {/* Lang ile aynı yapıda olup data ekleme modalında eklenecek dataların hangi dilde yazıldığını tutar */
    }
    const [selection, setSelection] = useState({});
    {/* [key]: boolena, bu type'da bir veri tutar datanın indexini key olarak kullanır o index'e ait olan satırın seçili olup olmadığını bu state tutar. */
    }

    {/* if else yapıları */
    }

    {/* verinin uzunluğunu sayfa başına gösterilecek veriye bölerek toplam sayfa sayısını alıyoruz. */
    }
    const totalPages = useMemo(() => Math.ceil(data.length / perPage), [data, perPage]);

    {/* handlePrevious ve handleNext fonksiyonları page state'indeki pageIndex'i 1 arttırır veya 1 azaltır bu şekilde sayfalar arası geçiş yapılır. */
    }
    const handlePrevious = () => setPage((prev) => ({pageSize: perPage, pageIndex: prev.pageIndex - 1}));
    const handleNext = () => setPage((prev) => ({pageSize: perPage, pageIndex: prev.pageIndex + 1}));

    {/* canNextPage ve canPreviousPage fonksiyonları 'bir sonraki'/'bir önceki' sayfaya gidilebilir mi böyle bir sayfa var mı? bunu sorgular. */
    }
    const canNextPage = () => page.pageIndex === totalPages - 1;
    const canPreviousPage = () => page.pageIndex === 0;

    {/* tablodaki filterlanmış verimin hepsi selection datamda var mı var ise value'su true mu? bunu kontrol eder. */
    }
    const isSelectedAll = () => table.getRows().length > 0 && table.getRows().every((row, index) => selection[index])

    {/* fonksiyonların çağrılması */
    }
    const table = TableFunctions({
        columns, visible, data, filters, pagination, page, sorting, isSelectedAll, setFilters, setSorting, setSelection
    });

    return (<div className=" h-full flex flex-col gap-4">
        {/* TABLE-TOP */}
        <div className="flex flex-wrap items-center w-full gap-4">
            {/* GLOBAL FİLTER START */}
            {/* global filter'ın inputu burada */}
            <Input
                value={filters.global}
                onChange={(e) => setFilters((prev) => ({columns: prev.columns, global: e.target.value}))}
                placeholder="Search in data table."
                className="w-screen max-w-sm !outline-none !ring-muted-foreground"
            />
            {/* GLOBAL FİLTER END */}

            {/* SET VİSİBLE START */}
            {/* header (başlık) yani column'ların visible statini buradan kontrol ediyoruz burada bir dropdownmenu çalışıyor */}
            <DropdownMenu>
                <DropdownMenuTrigger className="">
                    <Button variant="outline" className="">
                        Columns
                        <ArrowDownIcon className="w-3.5 h-3.5 ml-2"/>
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="start">
                    {columns.filter((col) => !col.hide).map((column) => (<DropdownMenuCheckboxItem
                        onCheckedChange={(value) => {
                            setVisible((prev) => ({...prev, [column.dt_name]: value}));
                        }}
                        checked={visible[column.dt_name] ?? true}
                        key={column.dt_name}
                        className="capitalize"
                    >
                        {column.header}
                    </DropdownMenuCheckboxItem>))}
                </DropdownMenuContent>
            </DropdownMenu>
            {/* SET VİSİBLE END */}

            {/* SET LANGUAGE START */}
            {/* lang (language) statini buradan kontrol ediyoruz burada bir dropdownmenu çalışıyor */}
            <DropdownMenu>
                <DropdownMenuTrigger className="!ring-0" asChild>
                    {lang ? <Button variant="outline">
                        <img alt={lang?.name} className="w-8" src={lang?.image}/>
                    </Button> : <Button variant="outline">Deafult</Button>}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => setLang(null)}>Default</DropdownMenuItem>
                    {langs.map((lang, idx) => (
                        <DropdownMenuItem key={idx} onClick={() => setLang(lang)}>{lang.code}</DropdownMenuItem>))}
                </DropdownMenuContent>
            </DropdownMenu>
            {/* SET LANGUAGE END */}

            {/* Theme Toggle Butonu sistemde hali hazırda olan bir component. */}
            <ThemeToggle/>

            {/* DELETE SELECTED STAR */}
            {/* Burada bir modal ve bu modal'ın tetikleyici butonu var, buradaki modal emin misiniz tarzı bir soru soruyor. */}
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
            {/* DELETE SELECTED END */}

            {/* DELETE ALL STAR */}
            {/* Burada bir modal ve bu modal'ın tetikleyixi butonu var, buradaki modal emin misiniz tarzı bir soru soruyor. */}
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
                                // tüm veriler içerisinde mevcut global ve column filterlarını uyguluyoruz ve eğerki bu filterlardan geçemez ise true döndürüyoruz çünkü burada filterdan geçen veriler siliniyor yani bize geçemeyen veriler lazım
                                const filteredData = data.filter((item) => !table.applyFilters(item));

                                setData(filteredData);
                                // reset filters
                                setFilters({global: "", columns: []});

                                toast.warning("Deleted All Data");
                            }}
                        >
                            Continue
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            {/* DELETE ALL END */}

            {/* ADD DATA MODAL START */}
            {/* BU BLOCK DATA EKLEME MODALINI İÇERİR */}
            <Dialog open={openAddModal} onOpenChange={setOpenAddModal}>
                {/* Modal'ı tetikleyen buton */}
                <DialogTrigger asChild>
                    <Button variant="outline">Add Data</Button>
                </DialogTrigger>

                {/* Modal içeriği */}
                <DialogContent className={"lg:max-w-2xl overflow-y-auto h-fit"}>
                    <form
                        className="outline-none rounded-md"
                        onSubmit={(e) => {
                            // form tetiklenir (submit) ise dataya modal'daki inputların tutulduğu state'i ve id: datanın uzunluğu + 1 ekle
                            e.preventDefault();
                            const st = addModalState;
                            setData((prevState) => [...prevState, {id: prevState.length + 1, ...st}]);
                            // modal'ı kapat
                            setAddModalLang(null)
                            toast.success("Successfully added new data");
                            // reset state's
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
                                {/* Data ekleme modalındaki lang (language)'in tutulduğu ve kontrol edildiği kısım */}
                                <DropdownMenuTrigger className="!ring-0 ml-auto" asChild>
                                    {addModalLang ? <Button variant="outline">
                                        <img alt={addModalLang?.name} className="w-8"
                                             src={addModalLang?.image}/>
                                    </Button> : <Button variant="outline">Deafult</Button>}
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                    <DropdownMenuItem
                                        onClick={() => setAddModalLang(null)}>Default</DropdownMenuItem>
                                    {langs.map((lang, idx) => (// tüm dilleri maple ve her birini dropdown içinde bir item olarak kullan
                                        <DropdownMenuItem key={idx}
                                                          onClick={() => setAddModalLang(lang)}>{lang.code}</DropdownMenuItem>))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* DATA EKLMEK İÇİN İNPUTLAR */}
                        <div className="flex flex-col gap-5 py-6">
                            {columns
                                // eğerki bu header (başlık) yani column'umun enableForm değeri true ise ve modal'da tuttuğum lang (language) data null ise veya column'umun translate değeri true ise filterdan geçir.
                                .filter((x) => x?.enableForm && (addModalLang === null || x?.translate))
                                // filterlanmış columns datamı maple ve bir input döndür
                                .map((column, col_index) => {
                                    // modal içindeki lang (language) datam null ise sadece column.dt_name değil ise yani bir dil seçildiyse dt_name'e seçilmiş dilimin code (addModalLang.code) değerini ekle ve bu şekilde kullan
                                    const columnKey = addModalLang === null ? column?.dt_name : column?.dt_name + addModalLang?.code;

                                    return (<div
                                        className="grid gridcol-4 items-center gap-4"
                                        key={col_index + columnKey}
                                    >
                                        <Label className="text-left w-full capitalize">
                                            {column?.dt_name?.replaceAll("_", " ")}
                                        </Label>
                                        <Input
                                            onChange={(event) => setAddModalState((prevState) => ({
                                                ...prevState, [columnKey]: event.target.value,
                                            }))}
                                            type={column?.type}
                                            value={addModalState[columnKey]}
                                            required
                                            id={columnKey}
                                            placeholder={(addModalLang ? addModalLang?.code + " " : "") + column?.dt_name?.replaceAll("_", " ")}
                                        />
                                    </div>);
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
            {/* ADD DATA MODAL END */}

            {// column yani tekli filterlarımın uzunluğu 0 dan büyük ise veya herhangi bir sıralama işlemi uygulandıysa bu butonu render et
                filters.columns.length > 0 || sorting?.id ? (<Button
                    onClick={() => {
                        /* filters state'inin columns değerini sıfırla */
                        setFilters((prevState) => ({global: prevState.global, columns: []}))
                        /* sorting state'ini sıfırla */
                        setSorting({})
                    }}
                    variant="destructive"
                >
                    Clear Filters
                </Button>) : null}
        </div>

        {/* TABLE MAİN BLOCK -> div */}
        <div className="rounded border ">
            {/* Table -> table */}
            <Table>
                {/* TABLE HEADER -> thead */}
                <TableHeader>
                    {/* Tablo başlığı -> tr : th */}
                    <TableHead>
                        <Checkbox
                            checked={isSelectedAll()}
                            onCheckedChange={(val) => table.selectAll(val)}
                        />
                    </TableHead>
                    {table.getHeaders().map((column, idx) => (/* Tablo başlığı -> tr : th */
                        <TableHead key={idx} className="!w-fit">
                            {// eğer ki başlığın columnFilter değeri true ise bir string değil bir select box render et
                                column.columnFilter ? (<Select
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
                                                <SelectItem key={idx} value={val}
                                                            className="capitalize">{val}</SelectItem>))}
                                        </SelectContent>
                                    </Select>) : // eğer ki başlığın sortable değeri true ise bir string değil bir div render et ve her tıklandığında sortable değerini değiştir / kontrol et
                                    column.sortable ? (<div
                                        onClick={() => table.changeSorting(column)}
                                        className="w-fit border-b border-muted-foreground cursor-pointer flex items-center gap-2"
                                    >
                                        {column.header}
                                        {column.header !== sorting?.id && <ArrowDownUp className="w-4 h-4"/>}
                                        {column.header === sorting?.id ? (sorting?.value === "asc" ? (
                                            <ArrowDownIcon className="w-4 h-4"/>) : (
                                            <ArrowUpIcon className="w-4 h-4"/>)) : null}
                                    </div>) : (column.header)}
                        </TableHead>))}
                </TableHeader>

                {/* TableBody -> tbody */}
                <TableBody>
                    {table.getRows().map((dt, dt_idx) => {
                        return (/* TableRow -> tr */
                            <TableRow key={dt_idx}>
                                {/* TableCell -> td*/}
                                <TableCell>
                                    {/* Veriye bağlı olmamaksızın her zaman ilk başta bir selectbox render et bu satırı seçebilmek için. */}
                                    <Checkbox
                                        checked={selection[dt_idx] ?? false}
                                        onCheckedChange={() => setSelection(prev => ({
                                            ...prev, [dt_idx]: !prev[dt_idx] ?? true
                                        }))}
                                    />
                                </TableCell>
                                {table.getHeaders().map((col, col_idx) => {
                                    const CustomComponent = col?.cell ?? null
                                    return (<TableCell key={col_idx}>{CustomComponent ?
                                        <CustomComponent {...col} {...dt}/> : dt[col.dt_name + lang?.code ?? ""] ?? dt[col.dt_name]}</TableCell>)
                                })}
                            </TableRow>)
                    })}
                </TableBody>
            </Table>
        </div>

        {/* PaginationType değerine göre 2 farklı butonu render et
         1.buton load => her tıklandığında aşağı doğru perPage değeri kadar daha veri ekler
         2.buton page => next ve previous butonu ile sayfalar arası geçiş sağlar
         */}
        {paginationType === "load" && (<Button
            disabled={data.length <= (page.pageIndex + 1) * perPage}
            onClick={() => setPage((prev) => ({
                pageSize: prev.pageSize + perPage, pageIndex: 0,
            }))}
            variant="link"
        >
            Load more...
        </Button>)}
        {paginationType === "page" && (<div className="mr-auto flex gap-3 items-center">
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
        </div>)}
    </div>);
};

export default CustomTable;
