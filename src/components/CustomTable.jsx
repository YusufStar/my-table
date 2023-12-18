'use client';

import { FC, useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import ThemeToggle from "@/components/ThemeToggle";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";

const CustomTable = ({
                         columns,
                         initial_dt,
                         perPage = 10,
                         pagination = true,
                         paginationType = "page",
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

    const getHeaders = () => {
        return columns.filter((col) => visible[col.dt_name.toLowerCase()] ?? true);
    };

    const totalPages = Math.ceil(data.length / perPage);

    const applyFilters = (item) => {
        const globalSearch = () =>
            Object.values(item).some((value) => {
                    // @ts-ignore
                    return value.toString().toLowerCase().includes(filters.global.toLowerCase());
                }
            );

        const columnSearch = (columnName, filterValue) => {
            const column = columns.find((col) => col.dt_name === columnName);
            if (column) {
                const filterType = column.filter;

                if (filterType === "include") {
                    return item[columnName].includes(filterValue);
                } else if (filterType === "equal") {
                    return item[columnName] === filterValue;
                }
            }
            return true;
        };

        return globalSearch() && filters.columns.every((colFilter) =>
            columnSearch(Object.keys(colFilter)[0], colFilter[Object.keys(colFilter)[0]])
        );
    };

    const getRows = () => {
        let filteredData = data;

        if (pagination) {
            filteredData = filteredData.filter((item) => applyFilters(item)).slice(page.pageIndex * page.pageSize, (page.pageIndex + 1) * page.pageSize);
        } else {
            filteredData.filter((item) => applyFilters(item));
        }

        return filteredData;
    };

    const handlePrevious = () => {
        setPage((prev) => ({
            ...prev,
            pageIndex: Math.max(prev.pageIndex - 1, 0),
        }));
    };

    const handleNext = () => {
        setPage((prev) => ({
            ...prev,
            pageIndex: Math.min(prev.pageIndex + 1, totalPages - 1),
        }));
    };

    const getUniqueValues = (columnName, data) => {
        const uniqueValues = new Set();

        data.forEach((item) => {
            if (item[columnName] !== undefined) {
                uniqueValues.add(item[columnName].toString());
            }
        });

        return Array.from(uniqueValues);
    };

    const uniqueValues = (columnName) => {
        const uniqueValuesByColumn = {};

        getHeaders().forEach((col) => {
            const columnName = col.dt_name;
            uniqueValuesByColumn[columnName] = getUniqueValues(columnName, data);
        });

        return uniqueValuesByColumn[columnName] || [];
    };

    return (
        <div className="w-full h-full flex flex-col gap-4">
            <div className="flex items-center w-full gap-4">
                <Input
                    value={filters.global}
                    onChange={(e) => setFilters(prevState => ({ ...prevState, global: e.target.value }))}
                    placeholder="Search in data table."
                    className="max-w-sm !outline-none !ring-muted-foreground"
                />
                <ThemeToggle />

                <AlertDialog>
                    <AlertDialogTrigger disabled={data.length === 0}
                                        className="ml-auto disabled:pointer-events-none disabled:opacity-50">
                        <Button variant="outline">
                            Delete All
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Delete all rows
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => {
                                    const filteredData = data.filter((item) => !applyFilters(item));

                                    setData(filteredData);
                                    setFilters({ global: "", columns: [] });

                                    toast.warning("Deleted All Data");
                                }}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <Dialog open={openAddModal} onOpenChange={setOpenAddModal}>
                    <DialogTrigger asChild>
                        <Button variant="outline">Add Data</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                        <form className="outline-none rounded-md" onSubmit={(e) => {
                            e.preventDefault();
                            const st = addModalState;
                            setData(prevState => [...prevState, {
                                id: prevState.length + 1,
                                ...st
                            }]);
                            toast.success("Successfully added new data");
                            setAddModalState({});
                            setOpenAddModal(false);
                        }}>
                            <DialogHeader>
                                <DialogTitle>Add Data</DialogTitle>
                                <DialogDescription>
                                    Click add when you're done.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-4 py-4">
                                {columns
                                    // @ts-ignore
                                    .filter(x => x?.enableForm)
                                    .map((column) => (
                                        <div className="grid grid-cols-4 items-center gap-4" key={column.id}>
                                            <Label htmlFor="name" className="text-right w-fit capitalize">
                                                {// @ts-ignore
                                                    column?.dt_name?.replaceAll("_", " ")}
                                            </Label>
                                            <Input
                                                onChange={(event) => setAddModalState(prevState => ({ ...prevState, [column?.dt_name]: event.target.value }))}
                                                type={column?.type}
                                                required
                                                id={column?.dt_name}
                                                placeholder={column?.dt_name?.replaceAll("_", " ")}
                                                className="col-span-3"
                                            />
                                        </div>
                                    ))}
                            </div>
                            <DialogFooter>
                                <DialogClose className="mr-4">
                                    <Button variant="secondary" type="reset">
                                        Close
                                    </Button>
                                </DialogClose>
                                <Button type="submit" variant="destructive">Add Data</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {filters.columns.length > 0 ?
                    <Button onClick={() => setFilters(prevState => ({ ...prevState, columns: [] }))} variant="destructive">Clear Filters</Button> : null}
            </div>

            <div className="rounded border">
                <Table>
                    <TableHeader>
                        {getHeaders().map((column, idx) => (
                            <TableHead key={idx}>
                                {column.columnFilter
                                    ? <Select
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
                                                        ? [...withoutAllFilter, { [column.dt_name]: newVal }]
                                                        : withoutAllFilter;

                                                return {
                                                    ...prevFilters,
                                                    columns: newColumns,
                                                };
                                            });
                                        }}>
                                        <SelectTrigger className="px-2 w-32 !ring-transparent">
                                            <SelectValue placeholder="All" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectItem defaultChecked={true} value="all">All</SelectItem>
                                                {uniqueValues(column.dt_name).map((val) => (
                                                    <SelectItem value={val}>{val}</SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    : column.header}
                            </TableHead>
                        ))}
                    </TableHeader>

                    <TableBody>
                        {getRows().map((dt, dt_idx) => (
                            <TableRow key={dt_idx}>
                                {getHeaders().map((col, col_idx) => (
                                    <TableCell key={col_idx}>{dt[col.dt_name]}</TableCell>
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
                        disabled={page.pageIndex === 0}
                        onClick={handlePrevious}
                        variant="outline"
                    >
                        Previous
                    </Button>
                    <Button
                        disabled={page.pageIndex === totalPages - 1}
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
