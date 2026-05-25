import * as svc from './service.js';

export const getCart = async (req, res, next) => {
  try { res.json({ success: true, data: await svc.getCart(req.user.id) }); } catch (e) { next(e); }
};
export const addToCart = async (req, res, next) => {
  try { res.status(201).json({ success: true, data: await svc.addToCart(req.user.id, req.body) }); } catch (e) { next(e); }
};
export const updateCartItem = async (req, res, next) => {
  try { res.json({ success: true, data: await svc.updateCartItem(req.user.id, req.params.itemId, req.body.quantity) }); } catch (e) { next(e); }
};
export const removeCartItem = async (req, res, next) => {
  try { await svc.removeCartItem(req.user.id, req.params.itemId); res.json({ success: true, message: 'Item removed' }); } catch (e) { next(e); }
};
