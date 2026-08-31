import { useState, useMemo, useEffect } from "react";
import {
  TransactionDetail,
  TransactionFilterState,
  TransactionStatus,
  WasteCategoryKey,
  DepositMethod,
} from "@/types/transaction";
import { getUserTransactionHistory } from "@/app/actions/transactions";

export interface TransactionSummaryStats {
  totalCount: number;
  totalConfirmedKg: number;
  totalPointsEarned: number;
  totalCo2Saved: number;
  pendingCount: number;
}

export function useTransactionHistory(
  initialData?: TransactionDetail[],
  itemsPerPage: number = 5
) {
  const [transactions, setTransactions] = useState<TransactionDetail[]>(initialData || []);
  const [isLoading, setIsLoading] = useState<boolean>(!initialData);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [filters, setFilters] = useState<TransactionFilterState>({
    searchQuery: "",
    statusFilter: "all",
    categoryFilter: "all",
    methodFilter: "all",
    sortBy: "latest",
  });
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionDetail | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);

  // Fetch real user transactions from Supabase database
  const refetch = async () => {
    try {
      const data = await getUserTransactionHistory();
      if (data && data.length > 0) {
        setTransactions(data);
      }
    } catch (err) {
      console.error("Error refreshing user transaction history:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    refetch();

    const handleFocus = () => {
      refetch();
    };

    window.addEventListener("focus", handleFocus);
    const interval = setInterval(refetch, 4000);

    return () => {
      window.removeEventListener("focus", handleFocus);
      clearInterval(interval);
    };
  }, []);


  // Reset page to 1 whenever filters change
  const setSearchQuery = (query: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query }));
    setCurrentPage(1);
  };

  const setStatusFilter = (status: "all" | TransactionStatus) => {
    setFilters((prev) => ({ ...prev, statusFilter: status }));
    setCurrentPage(1);
  };

  const setCategoryFilter = (cat: WasteCategoryKey) => {
    setFilters((prev) => ({ ...prev, categoryFilter: cat }));
    setCurrentPage(1);
  };

  const setMethodFilter = (method: "all" | DepositMethod) => {
    setFilters((prev) => ({ ...prev, methodFilter: method }));
    setCurrentPage(1);
  };

  const setSortBy = (sortBy: TransactionFilterState["sortBy"]) => {
    setFilters((prev) => ({ ...prev, sortBy }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      searchQuery: "",
      statusFilter: "all",
      categoryFilter: "all",
      methodFilter: "all",
      sortBy: "latest",
    });
    setCurrentPage(1);
  };

  // Filtered & Sorted Transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        // 1. Search Query (ID, material, dropPointName, pickupAddress)
        if (filters.searchQuery.trim()) {
          const q = filters.searchQuery.toLowerCase();
          const matchId = tx.id.toLowerCase().includes(q);
          const matchMaterial = tx.material.toLowerCase().includes(q);
          const matchDropPoint = tx.dropPointName?.toLowerCase().includes(q) || false;
          const matchAddress = tx.pickupAddress?.toLowerCase().includes(q) || false;
          if (!matchId && !matchMaterial && !matchDropPoint && !matchAddress) {
            return false;
          }
        }

        // 2. Status Filter
        if (filters.statusFilter !== "all" && tx.status !== filters.statusFilter) {
          return false;
        }

        // 3. Category Filter
        if (filters.categoryFilter !== "all" && tx.categoryKey !== filters.categoryFilter) {
          return false;
        }

        // 4. Method Filter
        if (filters.methodFilter !== "all" && tx.method !== filters.methodFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === "highest_points") {
          return b.pointsEarned - a.pointsEarned;
        }
        if (filters.sortBy === "highest_weight") {
          return b.weightKg - a.weightKg;
        }
        if (filters.sortBy === "oldest") {
          return a.id.localeCompare(b.id);
        }
        // Default latest
        return b.id.localeCompare(a.id);
      });
  }, [transactions, filters]);

  // Pagination Calculation
  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / itemsPerPage));

  // Ensure current page does not exceed totalPages
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTransactions, currentPage, itemsPerPage]);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  // Summary Metrics Calculation
  const summaryStats: TransactionSummaryStats = useMemo(() => {
    let totalConfirmedKg = 0;
    let totalPointsEarned = 0;
    let totalCo2Saved = 0;
    let pendingCount = 0;

    transactions.forEach((tx) => {
      if (tx.status === "confirmed") {
        totalConfirmedKg += tx.weightKg;
        totalPointsEarned += tx.pointsEarned;
        totalCo2Saved += tx.co2SavedKg;
      } else if (tx.status === "pending") {
        pendingCount += 1;
      }
    });

    return {
      totalCount: transactions.length,
      totalConfirmedKg: Math.round(totalConfirmedKg * 10) / 10,
      totalPointsEarned,
      totalCo2Saved: Math.round(totalCo2Saved * 10) / 10,
      pendingCount,
    };
  }, [transactions]);

  // Open modal detail
  const openDetailModal = (tx: TransactionDetail) => {
    setSelectedTransaction(tx);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedTransaction(null);
  };

  return {
    transactions,
    isLoading,
    filteredTransactions,
    paginatedTransactions,
    currentPage,
    totalPages,
    itemsPerPage,
    setCurrentPage,
    goToNextPage,
    goToPrevPage,
    filters,
    summaryStats,
    selectedTransaction,
    isDetailModalOpen,
    setSearchQuery,
    setStatusFilter,
    setCategoryFilter,
    setMethodFilter,
    setSortBy,
    resetFilters,
    openDetailModal,
    closeDetailModal,
  };
}
