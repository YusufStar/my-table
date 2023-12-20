'use client'
import {useCallback} from "react";
import {arrayBufferToString} from "next/dist/server/app-render/action-encryption-utils";

// Tablo işlevlerini içeren bir özel kancayı oluşturdum
export const TableFunctions = ({
                                   columns,
                                   visible,
                                   data,
                                   filters,
                                   pagination,
                                   page,
                                   sorting,
                                   setFilters,
                                   setSorting,
                                   setSelection,
                                   isSelectedAll
                               }) => {

    // Sütun başlıklarını almak için özel bir kancayı tanımladım
    const getHeaders = useCallback(() => {
        return columns
            .filter((col) => !col.hide)
            .filter((col) => visible[col.dt_name.toLowerCase()] ?? true);
    }, [columns, visible]);

    // Filtreleri uygulamak için özel bir kancayı tanımladım
    const applyFilters = useCallback(
        (item) => {
            const globalSearch = () =>
                Object.values(item).some((value) =>
                    value.toString().toLowerCase().includes(filters.global.toLowerCase())
                );

            const columnSearch = (columnName, filterValue) => {
                const column = columns.find((col) => col.dt_name === columnName);
                if (column) {
                    const filterType = column.filter;

                    if (filterType === "include") {
                        return item[columnName].toLowerCase().includes(filterValue.toLowerCase());
                    } else if (filterType === "equal") {
                        return item[columnName].toLowerCase() === filterValue.toLowerCase();
                    }
                }
                return true;
            };

            return (
                globalSearch() &&
                filters.columns.every((colFilter) =>
                    columnSearch(
                        Object.keys(colFilter)[0],
                        colFilter[Object.keys(colFilter)[0]]
                    )
                )
            );
        },
        [filters, columns]
    );

    // Satırları almak için özel bir kancayı tanımladım
    const getRows = useCallback(() => {
        let filteredData = data;

        // Filtreleri uygula
        filteredData = filteredData.filter((item) => applyFilters(item));

        // Sıralamayı uygula
        if (sorting.id && sorting.value) {
            const column = columns.find((col) => col.header === sorting.id);
            if (column) {
                const comparator = (a, b) => {
                    const aValue = a[column.dt_name];
                    const bValue = b[column.dt_name];
                    return sorting.value === "asc" ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
                };

                filteredData = filteredData.sort(comparator);
            }
        }

        // Sayfalama uygula
        if (pagination) {
            filteredData = filteredData.slice(
                page.pageIndex * page.pageSize,
                (page.pageIndex + 1) * page.pageSize
            );
        }

        return filteredData;
    }, [data, pagination, applyFilters, page, sorting, columns]);

    // Belirli bir sütun için benzersiz değerleri almak için özel bir fonksiyon tanımladım
    const getUniqueValues = (columnName, data) => {
        const uniqueValues = new Set();

        data
            .forEach((item) => {
            if (item[columnName] !== undefined) {
                uniqueValues.add(item[columnName].toString().toLowerCase());
            }
        });

        return Array.from(uniqueValues);
    };

    // Tüm sütunlar için benzersiz değerleri almak için özel bir fonksiyon tanımladım
    const uniqueValues = (columnName) => {
        const uniqueValuesByColumn = {};

        getHeaders().forEach((col) => {
            const columnName = col.dt_name;
            uniqueValuesByColumn[columnName] = getUniqueValues(columnName, data);
        });

        return uniqueValuesByColumn[columnName] || uniqueValuesByColumn;
    };


    const changeFilter = (name, val) => {
        setFilters((prevFilters) => {
            const updatedColumns = prevFilters.columns.filter(
                (col) => Object.keys(col)[0] !== name
            );

            const withoutAllFilter = updatedColumns.filter(
                (col) => Object.values(col)[0] !== null
            );

            const newColumns =
                val !== "all"
                    ? [...withoutAllFilter, {[name]: val}]
                    : withoutAllFilter

            return {
                ...prevFilters,
                columns: newColumns,
            };
        });
    };

    const selectAll = (val) => {
        const filteredRows = getRows();
        const newSelection = {};

        if (isSelectedAll()) {
            // If already selected, unselect all filtered rows
            filteredRows.forEach((row, index) => {
                newSelection[index] = false;
            });
        } else {
            // If not already selected, select all filtered rows
            filteredRows.forEach((row, index) => {
                newSelection[index] = true;
            });
        }

        setSelection(newSelection);
    }

    const changeSorting = (column) => {
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
    }

    // Dışa açılan fonksiyonları döndür
    return {
        uniqueValues,
        getHeaders,
        getRows,
        applyFilters,
        changeFilter,
        changeSorting,
        selectAll
    };
};

const role = "ADMIN"

/*
header: header bir string veya bir number alır tablo başlığı olarak kullanılır.
dt_name: bu value başlığın datadan hangi key ile veri çekeceğini belirtir bir string alır.
sortable: bu başlık altındaki veriler sıralamaya tabi tutulacak mı? sıralama olacak mı?
filter: "include" yada "equal" alır içerisinde olması yeterli mi yoksa eşit mi olacak bunu kontrol eder.
enableForm: Data ekleme modalında görünecek mi (bir input olarak)
type: Data ekleme modalında olan inputun type'ını belirtir "text", "email", "number" vb...
translate: Data ekleme modalında ki ekstra dil ekleme özelliklerini kullanacak mı?
hide: true ise tabloda görünmez.
columnFilter: select ile bir filterlama işlemi yapılacak mı?
cell: () => {}, bir component alır içerisine ve bu headerın altındaki verilerde bu component'ı kullanır tüm datayı props olarak alır.
 */


// Test için kullanılan sütunlar
export const TestColumns = [
    {
        header: "ID",
        dt_name: "id",
        sortable: true,
    },
    {
        header: "First Name",
        dt_name: "first_name",
        filter: "include",
        enableForm: true,
        type: "text",
        translate: true
    },
    {
        header: "Last Name",
        dt_name: "last_name",
        filter: "include",
        enableForm: true,
        type: "text",
        translate: true
    },
    {
        header: "Email",
        dt_name: "email",
        filter: "include",
        enableForm: true,
        type: "text",
        translate: true
    },
    {
        header: "Gender",
        dt_name: "gender",
        filter: "equal",
        enableForm: true,
        type: "text",
        columnFilter: true,
        translate: true,
        hide: role === "ADMIN" ? false : true
    },
];
