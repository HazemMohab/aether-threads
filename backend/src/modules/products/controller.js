import * as svc from './service.js';

export const getProducts = async (req, res, next) => {
  try { res.json({ success: true, data: await svc.getProducts(req.query) }); } catch (e) { next(e); }
};
export const getProductBySlug = async (req, res, next) => {
  try { res.json({ success: true, data: await svc.getProductBySlug(req.params.slug) }); } catch (e) { next(e); }
};
export const getCategories = async (req, res, next) => {
  try { res.json({ success: true, data: await svc.getCategories() }); } catch (e) { next(e); }
};
export const createProduct = async (req, res, next) => {
  try { res.status(201).json({ success: true, data: await svc.createProduct(req.body) }); } catch (e) { next(e); }
};
export const updateProduct = async (req, res, next) => {
  try { res.json({ success: true, data: await svc.updateProduct(req.params.id, req.body) }); } catch (e) { next(e); }
};
export const deleteProduct = async (req, res, next) => {
  try { await svc.deleteProduct(req.params.id); res.json({ success: true, message: 'Product deleted' }); } catch (e) { next(e); }
};

// POST /products/upload — admin only, returns the public path of the saved file
export const uploadImage = (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  res.json({ success: true, url: `/uploads/${req.file.filename}` });
};
