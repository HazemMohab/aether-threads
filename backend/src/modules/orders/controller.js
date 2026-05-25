import * as svc from './service.js';

export const createOrder = async (req, res, next) => {
  try { res.status(201).json({ success: true, data: await svc.createOrder(req.user.id, req.body) }); } catch (e) { next(e); }
};
export const getOrders = async (req, res, next) => {
  try { res.json({ success: true, data: await svc.getOrders(req.user.id, req.user.role) }); } catch (e) { next(e); }
};
export const getOrderById = async (req, res, next) => {
  try { res.json({ success: true, data: await svc.getOrderById(req.params.id, req.user.id, req.user.role) }); } catch (e) { next(e); }
};
export const updateOrderStatus = async (req, res, next) => {
  try { res.json({ success: true, data: await svc.updateOrderStatus(req.params.id, req.body.status) }); } catch (e) { next(e); }
};
