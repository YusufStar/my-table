import {useCallback, useMemo} from "react";

export const TableFunctions = ({
                          columns,
                          visible,
                          data,
                          perPage,
                          filters,
                          pagination,
                          setPage,
                          page

                      }) => {
    const getHeaders = useCallback(() => {
        return columns.filter((col) => visible[col.dt_name.toLowerCase()] ?? true);
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
                }

            return globalSearch() && filters.columns.every((colFilter) =>
                columnSearch(Object.keys(colFilter)[0], colFilter[Object.keys(colFilter)[0]])
            );
        },
        [filters, columns]
    );

    const getRows = useCallback(() => {
        let filteredData = data;

        if (pagination) {
            filteredData = filteredData
                .filter((item) => applyFilters(item))
                .slice(page.pageIndex * page.pageSize, (page.pageIndex + 1) * page.pageSize);
        } else {
            filteredData.filter((item) => applyFilters(item));
        }

        return filteredData;
    }, [data, pagination, applyFilters, page]);

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

    return {
        uniqueValues,
        getHeaders,
        getRows,
        applyFilters,
    }
}

export const TestColumns =  [
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