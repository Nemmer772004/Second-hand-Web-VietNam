'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import type { LucideIcon } from 'lucide-react';
import { User, LogOut, ShoppingBag, Heart, Settings, Bell, TicketPercent, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWishlist } from '@/context/wishlist-context';
import Image from 'next/image';
import { GET_MY_ORDERS, GET_MY_VOUCHERS, CONFIRM_ORDER_RECEIPT, CANCEL_ORDER, UPDATE_ORDER, CREATE_PRODUCT_REVIEW } from '@/lib/queries';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending_confirmation: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  processing: 'Đang xử lý',
  shipped: 'Đang giao',
  delivered: 'Đã giao',
  completed: 'Hoàn tất',
  cancelled: 'Đã huỷ',
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  paid_online: 'Thanh toán trực tuyến',
  cod: 'Thanh toán khi nhận hàng',
  bank_transfer: 'Chuyển khoản ngân hàng',
  card: 'Thẻ thanh toán',
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  paid: 'Đã thanh toán',
  pending: 'Chờ thanh toán',
  failed: 'Thanh toán thất bại',
  refunded: 'Đã hoàn tiền',
};

const ORDER_FILTERS = [
  { key: 'all', label: 'Tất cả', matcher: () => true },
  { key: 'pending_confirmation', label: 'Chờ xác nhận', matcher: (order: any) => (order.status as string) === 'pending_confirmation' },
  {
    key: 'shipping',
    label: 'Vận chuyển',
    matcher: (order: any) =>
      ['confirmed', 'processing'].includes(order.status as string),
  },
  {
    key: 'awaiting_delivery',
    label: 'Chờ giao hàng',
    matcher: (order: any) => ['shipped'].includes(order.status as string),
  },
  {
    key: 'completed',
    label: 'Hoàn thành',
    matcher: (order: any) =>
      ['delivered', 'completed'].includes(order.status as string),
  },
  { key: 'cancelled', label: 'Đã hủy', matcher: (order: any) => (order.status as string) === 'cancelled' },
  {
    key: 'refund',
    label: 'Trả hàng/Hoàn tiền',
    matcher: (order: any) => (order.paymentStatus as string) === 'refunded',
  },
] as const;

type OrderFilterKey = (typeof ORDER_FILTERS)[number]['key'];

const ORDER_BADGE_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending_confirmation: 'secondary',
  confirmed: 'secondary',
  processing: 'secondary',
  shipped: 'outline',
  delivered: 'default',
  completed: 'default',
  cancelled: 'destructive',
};

type AccountTab = 'notifications' | 'profile' | 'orders' | 'vouchers' | 'wishlist' | 'settings';

const NAV_ITEMS: Array<{ key: AccountTab; label: string; icon: LucideIcon }> = [
  { key: 'notifications', label: 'Thông báo', icon: Bell },
  { key: 'profile', label: 'Tài khoản của tôi', icon: User },
  { key: 'orders', label: 'Đơn mua', icon: ShoppingBag },
  { key: 'vouchers', label: 'Kho Voucher', icon: TicketPercent },
  { key: 'wishlist', label: 'Yêu thích', icon: Heart },
  { key: 'settings', label: 'Cài đặt', icon: Settings },
];

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-16">Đang tải tài khoản...</div>}>
      <AccountPageContent />
    </Suspense>
  );
}


function AccountPageContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<AccountTab>('profile');
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { wishlist, removeFromWishlist } = useWishlist();

  const [displayName, setDisplayName] = useState(user?.name || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '');
  const [isSaving, setIsSaving] = useState(false);
  const [orderFilter, setOrderFilter] = useState<OrderFilterKey>('all');
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [confirmingOrderId, setConfirmingOrderId] = useState<string | null>(null);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [editShippingAddress, setEditShippingAddress] = useState('');
  const [editNote, setEditNote] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewProduct, setReviewProduct] = useState<{ orderId: string; productId: string; productName: string } | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');

  const {
    data: myOrdersData,
    loading: ordersLoading,
    error: ordersError,
    refetch: refetchOrders,
  } = useQuery(GET_MY_ORDERS, {
    skip: !user,
    fetchPolicy: 'cache-and-network',
  });

  const [confirmReceiptMutation] = useMutation(CONFIRM_ORDER_RECEIPT);
  const [cancelOrderMutation] = useMutation(CANCEL_ORDER);
  const [updateOrderMutation] = useMutation(UPDATE_ORDER);
  const [createProductReviewMutation] = useMutation(CREATE_PRODUCT_REVIEW);

  const myOrders = useMemo(() => myOrdersData?.myOrders || [], [myOrdersData?.myOrders]);
  const filteredOrders = useMemo(() => {
    const search = orderSearchTerm.trim().toLowerCase();
    const activeFilter =
      ORDER_FILTERS.find((filter) => filter.key === orderFilter) || ORDER_FILTERS[0];

    return myOrders.filter((order: any) => {
      const matchesStatus = activeFilter.matcher(order);
      if (!matchesStatus) {
        return false;
      }

      if (!search) {
        return true;
      }

      const id = String(order.id || '').toLowerCase();
      const note = String(order.notes || '').toLowerCase();
      const itemMatched = Array.isArray(order.items)
        ? order.items.some((item: any) =>
            String(item.productName || item.productId || '')
              .toLowerCase()
              .includes(search),
          )
        : false;

      return (
        id.includes(search) ||
        note.includes(search) ||
        itemMatched
      );
    });
  }, [myOrders, orderFilter, orderSearchTerm]);

  const {
    data: myVouchersData,
    loading: vouchersLoading,
    error: vouchersError,
    refetch: refetchVouchers,
  } = useQuery(GET_MY_VOUCHERS, {
    skip: !user,
    fetchPolicy: 'cache-and-network',
  });

  const myVouchers = useMemo(
    () => myVouchersData?.myVouchers || [],
    [myVouchersData?.myVouchers],
  );

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    const requestedTab = searchParams.get('tab');
    if (!requestedTab) return;
    const allowedTabs: AccountTab[] = ['notifications', 'profile', 'orders', 'wishlist', 'vouchers', 'settings'];
    if (allowedTabs.includes(requestedTab as AccountTab)) {
      setActiveTab(requestedTab as AccountTab);
    }
  }, [searchParams]);

  useEffect(() => {
    setDisplayName(user?.name || '');
    setPhoneNumber(user?.phone || '');
  }, [user?.name, user?.phone]);

  useEffect(() => {
    if (activeTab === 'orders' && user) {
      refetchOrders();
    }
  }, [activeTab, user, refetchOrders]);

  useEffect(() => {
    if (activeTab === 'vouchers' && user) {
      refetchVouchers();
    }
  }, [activeTab, user, refetchVouchers]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value || 0);

  const formatDateTime = (value?: string | null) =>
    value ? new Date(value).toLocaleString('vi-VN') : '—';

  const formatDate = (value?: string | null) =>
    value ? new Date(value).toLocaleDateString('vi-VN') : '—';

  if (loading) {
    return <div>Đang tải...</div>;
  }

  if (!user) {
    return null;
  }
  
  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: 'Đã đăng xuất',
        description: 'Bạn đã đăng xuất thành công.',
      });
      router.push('/');
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Đăng xuất thất bại',
        description: 'Đã xảy ra lỗi khi đăng xuất.',
      });
    }
  };
  
  const handleProfileUpdate = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
        // TODO: Tích hợp API cập nhật hồ sơ khi backend sẵn sàng.
        toast({
            title: 'Hồ sơ đã được cập nhật!',
            description: 'Thông tin của bạn đã được lưu.',
        });
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Cập nhật thất bại',
            description: 'Đã có lỗi xảy ra khi cập nhật hồ sơ của bạn.',
        });
    } finally {
        setIsSaving(false);
    }
  };

  const handleConfirmReceipt = async (orderId: string) => {
    setConfirmingOrderId(orderId);
    try {
      await confirmReceiptMutation({ variables: { id: orderId } });
      toast({
        title: 'Đã xác nhận nhận hàng',
        description: 'Cảm ơn bạn đã tin tưởng NovaMarket!',
      });
      await refetchOrders();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể xác nhận nhận hàng';
      toast({
        variant: 'destructive',
        title: 'Xác nhận thất bại',
        description: message,
      });
    } finally {
      setConfirmingOrderId(null);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Bạn có chắc chắn muốn huỷ đơn hàng này?')) {
      return;
    }
    setCancellingOrderId(orderId);
    try {
      await cancelOrderMutation({ variables: { id: orderId } });
      toast({
        title: 'Đã huỷ đơn hàng',
        description: 'Đơn hàng của bạn đã được huỷ thành công.',
      });
      await refetchOrders();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể huỷ đơn hàng';
      toast({
        variant: 'destructive',
        title: 'Huỷ đơn thất bại',
        description: message,
      });
    } finally {
      setCancellingOrderId(null);
    }
  };

  const openEditOrder = (order: any) => {
    setEditingOrderId(order.id);
    setEditShippingAddress(order.shippingAddress || '');
    setEditNote(order.notes || '');
    setIsEditDialogOpen(true);
  };

  const handleUpdateOrder = async () => {
    if (!editingOrderId) return;
    setUpdatingOrder(true);
    try {
      await updateOrderMutation({
        variables: {
          id: editingOrderId,
          input: {
            shippingAddress: editShippingAddress,
            note: editNote,
          },
        },
      });
      toast({ title: 'Đã cập nhật đơn hàng' });
      setIsEditDialogOpen(false);
      await refetchOrders();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể cập nhật đơn hàng';
      toast({
        variant: 'destructive',
        title: 'Cập nhật thất bại',
        description: message,
      });
    } finally {
      setUpdatingOrder(false);
    }
  };

  const openReviewDialog = (orderId: string, item: any) => {
    setReviewProduct({ orderId, productId: item.productId, productName: item.productName || item.productId });
    setReviewRating(5);
    setReviewContent('');
    setReviewDialogOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!reviewProduct) return;
    try {
      await createProductReviewMutation({
        variables: {
          productId: reviewProduct.productId,
          input: {
            star: reviewRating,
            content: reviewContent,
            reviewerName: user?.name || undefined,
          },
        },
      });
      toast({ title: 'Cảm ơn bạn đã đánh giá sản phẩm!' });
      setReviewDialogOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể gửi đánh giá';
      toast({
        variant: 'destructive',
        title: 'Đánh giá thất bại',
        description: message,
      });
    }
  };

  const renderVouchers = () => {
    if (vouchersLoading && myVouchers.length === 0) {
      return <div>Đang tải voucher...</div>;
    }

    if (vouchersError) {
      return (
        <div className="rounded-md border border-destructive p-4 text-destructive">
          Không thể tải voucher: {vouchersError.message}
        </div>
      );
    }

    if (myVouchers.length === 0) {
      return (
        <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground">
          Bạn chưa có voucher nào. Tiếp tục mua sắm để nhận thêm ưu đãi nhé!
          <div className="mt-4">
            <Button asChild>
              <Link href="/products">Khám phá ưu đãi</Link>
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2">
        {myVouchers.map((voucher: any) => {
          const status = voucher.status as string;
          const isExpired = status === 'expired';
          const isUsed = status === 'used';

          return (
            <div
              key={voucher.id}
              className={`rounded-lg border p-4 shadow-sm transition ${isExpired ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-headline text-lg font-semibold">{voucher.code}</p>
                  <p className="text-sm text-muted-foreground">
                    {voucher.description || 'Voucher ưu đãi dành riêng cho bạn.'}
                  </p>
                </div>
                <Badge variant={isExpired ? 'outline' : isUsed ? 'secondary' : 'default'}>
                  {isExpired ? 'Hết hạn' : isUsed ? 'Đã dùng' : 'Còn hiệu lực'}
                </Badge>
              </div>
              <div className="mt-3 space-y-1 text-sm">
                <p>
                  Ưu đãi:{' '}
                  {voucher.discountType === 'percentage'
                    ? `${voucher.discountValue}%`
                    : formatCurrency(Number(voucher.discountValue) || 0)}
                </p>
                {voucher.minOrderValue ? (
                  <p>Đơn tối thiểu: {formatCurrency(Number(voucher.minOrderValue) || 0)}</p>
                ) : null}
                {voucher.maxDiscountValue && voucher.discountType === 'percentage' ? (
                  <p>Giảm tối đa: {formatCurrency(Number(voucher.maxDiscountValue) || 0)}</p>
                ) : null}
                <p>
                  Hiệu lực: {formatDate(voucher.validFrom)} - {formatDate(voucher.validUntil)}
                </p>
              </div>
              {voucher.sourceOrderId && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Nhận từ đơn hàng #{voucher.sourceOrderId}
                </p>
              )}
              <div className="mt-3 text-xs text-muted-foreground">
                Đã dùng {voucher.usageCount ?? 0}/{voucher.usageLimit ?? 1} lần
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderOrders = () => {
    if (ordersLoading && myOrders.length === 0) {
      return <div>Đang tải đơn hàng...</div>;
    }

    if (ordersError) {
      return (
        <div className="rounded-md border border-destructive p-4 text-destructive">
          Không thể tải đơn hàng: {ordersError.message}
        </div>
      );
    }

    if (myOrders.length === 0) {
      return (
        <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground">
          Bạn chưa có đơn hàng nào. Bắt đầu mua sắm ngay!
          <div className="mt-4">
            <Button asChild>
              <Link href="/products">Khám phá sản phẩm</Link>
            </Button>
          </div>
        </div>
      );
    }

    if (filteredOrders.length === 0) {
      return (
        <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground">
          {orderSearchTerm.trim()
            ? (
              <span>
                Không tìm thấy đơn hàng khớp với "<span className="font-semibold">{orderSearchTerm}</span>".
              </span>
            )
            : 'Chưa có đơn hàng trong mục này.'}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {filteredOrders.map((order: any) => {
          const status = order.status as string;
          const badgeVariant = ORDER_BADGE_VARIANTS[status] || 'outline';
          const statusLabel = ORDER_STATUS_LABELS[status] || status || 'Không rõ';
          const paymentMethodLabel =
            PAYMENT_METHOD_LABELS[order.paymentMethod as string] || 'Không rõ';
          const paymentStatusLabel =
            PAYMENT_STATUS_LABELS[order.paymentStatus as string] || '—';
          const canConfirmReceipt = ['shipped', 'delivered'].includes(status) && order.paymentStatus !== 'refunded';
          const canModify = status === 'pending_confirmation';
          const canReview = ['completed', 'delivered'].includes(status);

          return (
            <div key={order.id} className="rounded-lg border p-4 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-headline text-lg font-semibold">
                      Đơn hàng #{order.id}
                    </p>
                    <Badge variant={badgeVariant}>{statusLabel}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Tạo lúc: {formatDateTime(order.createdAt)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Thanh toán: {paymentMethodLabel} • {paymentStatusLabel}
                  </p>
                  {order.notes && (
                    <p className="text-sm text-muted-foreground">Ghi chú: {order.notes}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase text-muted-foreground">Tổng thanh toán</p>
                  <p className="text-xl font-bold">{formatCurrency(order.totalAmount)}</p>
                  <p className="text-xs text-muted-foreground">
                    Cập nhật: {formatDateTime(order.updatedAt)}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {order.items?.map((item: any) => (
                  <div
                    key={`${order.id}-${item.productId}`}
                    className="flex items-center justify-between rounded-md bg-secondary/40 px-3 py-2"
                  >
                    <div>
                      <p className="font-medium">{item.productName || item.productId}</p>
                      <p className="text-xs text-muted-foreground">Mã: {item.productId}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">SL: {item.quantity}</p>
                        <p className="text-sm font-semibold">
                          {formatCurrency(
                            (item.lineTotal as number) ||
                              (item.price as number) * (item.quantity as number),
                          )}
                        </p>
                      </div>
                      {canReview && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openReviewDialog(order.id, item)}
                        >
                          Đánh giá
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                <p>
                  <strong>Địa chỉ giao hàng:</strong> {order.shippingAddress || '—'}
                </p>
                <p>
                  <strong>Thanh toán:</strong> {paymentStatusLabel}
                </p>
                <p>
                  <strong>Xác nhận:</strong> {formatDateTime(order.confirmedAt)}
                </p>
                <p>
                  <strong>Hoàn tất:</strong>{' '}
                  {['delivered', 'completed'].includes(order.status as string)
                    ? formatDateTime(order.updatedAt)
                    : '—'}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t pt-3">
                <p className="text-sm text-muted-foreground">
                  {order.paymentStatus === 'refunded'
                    ? 'Đơn hàng đã được hoàn tiền.'
                    : 'Cảm ơn bạn đã mua sắm tại cửa hàng chúng tôi!'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {canModify && (
                    <>
                      <Button variant="outline" size="sm" onClick={() => openEditOrder(order)}>
                        Sửa đơn
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCancelOrder(order.id)}
                        disabled={cancellingOrderId === order.id}
                      >
                        {cancellingOrderId === order.id ? 'Đang huỷ...' : 'Huỷ đơn'}
                      </Button>
                    </>
                  )}
                  {canConfirmReceipt && (
                    <Button
                      size="sm"
                      onClick={() => handleConfirmReceipt(order.id)}
                      disabled={confirmingOrderId === order.id}
                    >
                      {confirmingOrderId === order.id ? 'Đang xác nhận...' : 'Đã nhận hàng'}
                    </Button>
                  )}
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/support/orders?ref=${order.id}`}>Liên hệ hỗ trợ</Link>
                  </Button>
                  <Button variant="secondary" size="sm" asChild>
                    <Link href="/products">Mua lại</Link>
                  </Button>
      </div>
    </div>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa đơn hàng</DialogTitle>
            <DialogDescription>
              Bạn có thể cập nhật địa chỉ giao hàng hoặc ghi chú trước khi đơn được xác nhận.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-shipping">Địa chỉ giao hàng</Label>
              <Input
                id="edit-shipping"
                value={editShippingAddress}
                onChange={(e) => setEditShippingAddress(e.target.value)}
                placeholder="Nhập địa chỉ nhận hàng"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-note">Ghi chú</Label>
              <Textarea
                id="edit-note"
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
                placeholder="Ví dụ: Giao giờ hành chính, liên hệ trước khi giao..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              onClick={handleUpdateOrder}
              disabled={updatingOrder}
            >
              {updatingOrder ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đánh giá sản phẩm</DialogTitle>
            <DialogDescription>
              Hãy chia sẻ cảm nhận của bạn để chúng tôi phục vụ tốt hơn.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="font-medium">
              {reviewProduct?.productName}
            </p>
            <div className="space-y-2">
              <Label htmlFor="review-rating">Điểm đánh giá (1-5)</Label>
              <Input
                id="review-rating"
                type="number"
                min={1}
                max={5}
                value={reviewRating}
                onChange={(e) => setReviewRating(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="review-content">Nội dung đánh giá</Label>
              <Textarea
                id="review-content"
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
                placeholder="Sản phẩm có đáp ứng kỳ vọng của bạn hay không?"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" onClick={handleSubmitReview}>
              Gửi đánh giá
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  </div>
);
        })}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'notifications':
        return (
          <div>
            <h2 className="font-headline text-2xl font-bold mb-4">Thông Báo</h2>
            <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground">
              Hiện chưa có thông báo mới. Khi có cập nhật về đơn hàng hoặc ưu đãi, chúng tôi sẽ thông báo tại đây.
            </div>
          </div>
        );
      case 'profile':
        return (
          <div>
            <h2 className="font-headline text-2xl font-bold mb-4">Hồ Sơ Của Tôi</h2>
            <div className="space-y-4">
              <p><strong>Tên:</strong> {displayName || user.name || 'N/A'}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Số điện thoại:</strong> {phoneNumber || 'Chưa cung cấp'}</p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Chỉnh sửa hồ sơ</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Chỉnh sửa hồ sơ</DialogTitle>
                    <DialogDescription>
                      Cập nhật thông tin cá nhân của bạn tại đây. Nhấn lưu để hoàn tất.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">Tên</Label>
                      <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="phone" className="text-right">Số điện thoại</Label>
                      <Input id="phone" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="col-span-3" />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" onClick={handleProfileUpdate} disabled={isSaving}>
                        {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        );
      case 'vouchers':
        return (
          <div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-headline text-2xl font-bold">Kho Voucher</h2>
                <p className="text-sm text-muted-foreground">
                  Sử dụng voucher khi thanh toán để được giảm giá đơn hàng của bạn.
                </p>
              </div>
              {vouchersLoading && myVouchers.length > 0 && (
                <span className="text-sm text-muted-foreground">Đang cập nhật voucher...</span>
              )}
            </div>
            <div className="mt-6">{renderVouchers()}</div>
          </div>
        );
      case 'orders':
        return (
          <div>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="font-headline text-2xl font-bold">Đơn Hàng Của Tôi</h2>
                {ordersLoading && myOrders.length > 0 && (
                  <span className="text-sm text-muted-foreground">Đang cập nhật...</span>
                )}
              </div>
              <div className="relative w-full max-w-md">
                <Input
                  value={orderSearchTerm}
                  onChange={(e) => setOrderSearchTerm(e.target.value)}
                  placeholder="Tìm theo mã đơn hoặc tên sản phẩm"
                  className="pl-10"
                />
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {ORDER_FILTERS.map((filter) => (
                <Button
                  key={filter.key}
                  variant={orderFilter === filter.key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setOrderFilter(filter.key)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
            <div className="mt-6">{renderOrders()}</div>
          </div>
        );
      case 'wishlist':
        return (
          <div>
            <h2 className="font-headline text-2xl font-bold mb-4">Danh Sách Yêu Thích</h2>
            {wishlist.length > 0 ? (
              <div className="space-y-4">
                {wishlist.map((item) => (
                  <div key={item.id} className="border p-4 rounded-lg flex items-center gap-4">
                    <Image
                      src={item.image || '/images/placeholder.png'}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="w-20 h-20 object-cover rounded-md"
                      unoptimized={!item.image}
                    />
                    <div className="flex-grow">
                      <Link href={`/products/${item.id}`} className="font-bold hover:underline">
                        {item.name}
                      </Link>
                      <p className="text-muted-foreground">{formatCurrency(item.price)}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => removeFromWishlist(item.id)}>
                      Xóa
                    </Button>
                    <Button asChild size="sm">
                      <Link href={`/products/${item.id}`}>Xem Sản Phẩm</Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <Heart className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">Danh sách yêu thích của bạn đang trống.</p>
                <Button asChild className="mt-4">
                  <Link href="/products">Bắt đầu mua sắm</Link>
                </Button>
              </div>
            )}
          </div>
        );
      case 'settings':
        return (
          <div>
            <h2 className="font-headline text-2xl font-bold mb-4">Cài Đặt</h2>
            <p className="text-muted-foreground">Quản lý cài đặt tài khoản và tùy chọn của bạn tại đây.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="grid lg:grid-cols-[280px,1fr] gap-8">
        <div className="border rounded-lg p-6 space-y-6">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center">
              <User className="h-8 w-8" />
            </div>
            <div>
              <p className="font-bold text-lg">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <nav className="space-y-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}
                  onClick={() => setActiveTab(item.key)}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <Button variant="outline" className="w-full" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Đăng xuất
          </Button>
        </div>

        <div className="border rounded-lg p-6 bg-background">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
