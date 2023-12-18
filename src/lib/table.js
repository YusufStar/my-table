import { useCallback } from "react";

export const TableFunctions = ({
                                   columns,
                                   visible,
                                   data,
                                   filters,
                                   pagination,
                                   page,
                                   sorting,
                               }) => {
    const getHeaders = useCallback(() => {
        return columns
            .filter((col) => !col.hide)
            .filter((col) => visible[col.dt_name.toLowerCase()] ?? true);
    }, [columns, visible]);

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
                        return item[columnName].includes(filterValue);
                    } else if (filterType === "equal") {
                        return item[columnName] === filterValue;
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

    const getRows = useCallback(() => {
        let filteredData = data;

        // Apply filters
        filteredData = filteredData.filter((item) => applyFilters(item));

        // Apply sorting
        if (sorting.id && sorting.value) {
            const column = columns.find((col) => col.header === sorting.id);
            if (column) {
                const comparator = (a, b) => {
                    const aValue = a[column.dt_name];
                    const bValue = b[column.dt_name];
                    if (sorting.value === "asc") {
                        return aValue > bValue ? 1 : -1;
                    } else {
                        return aValue < bValue ? 1 : -1;
                    }
                };

                filteredData = filteredData.sort(comparator);
            }
        }

        // Apply pagination
        if (pagination) {
            filteredData = filteredData.slice(
                page.pageIndex * page.pageSize,
                (page.pageIndex + 1) * page.pageSize
            );
        }

        return filteredData;
    }, [data, pagination, applyFilters, page, sorting, columns]);

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

        return uniqueValuesByColumn[columnName] || uniqueValuesByColumn;
    };

    return {
        uniqueValues,
        getHeaders,
        getRows,
        applyFilters,
    };
};

export const TestColumns = [
    {
        header: "id",
        dt_name: "id",
        sortable: true
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
        sortable: true,
        type: "text"
    },
    {
        header: "Gender",
        dt_name: "gender",
        filter: "equal",
        columnFilter: true,
        enableForm: true,
        type: "text"
    },
    {
        header: "Password",
        dt_name: "password",
        enableForm: true,
        type: "password",
        hide: true
    }
]