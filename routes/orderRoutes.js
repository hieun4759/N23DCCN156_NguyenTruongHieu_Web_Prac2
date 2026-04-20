const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// GET tất cả đơn hàng (Hỗ trợ lọc theo trạng thái và sắp xếp theo tổng tiền)
router.get('/', async (req, res) => {
    try {
        let query = {};
        
        // Yêu cầu 1: Lọc theo trạng thái đơn hàng
        if (req.query.status) {
            query.status = req.query.status;
        }

        let sortOption = { createdAt: -1 }; // Mặc định sắp xếp ngày tạo mới nhất
        
        // Yêu cầu 3: Sắp xếp theo tổng tiền
        if (req.query.sort) {
            sortOption = { totalAmount: req.query.sort === 'asc' ? 1 : -1 };
        }

        const orders = await Order.find(query).sort(sortOption);
        res.json(orders);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// Yêu cầu 2: Tìm kiếm theo tên khách hàng
router.get('/search', async (req, res) => {
    try {
        if (!req.query.name) {
            return res.status(400).json({ message: 'Vui lòng cung cấp tham số name để tìm kiếm' });
        }
        
        const orders = await Order.find({ 
            customerName: { $regex: req.query.name, $options: 'i' } 
        });
        
        res.json(orders);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET theo ID
router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        res.json(order);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST tạo mới
router.post('/', async (req, res) => {
    const order = new Order(req.body);
    try {
        const newOrder = await order.save();
        res.status(201).json(newOrder);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

// PUT cập nhật
router.put('/:id', async (req, res) => {
    try {
        const updated = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updated) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        res.json(updated);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

// DELETE xóa
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Order.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        res.json({ message: 'Đã xóa đơn hàng thành công!' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;