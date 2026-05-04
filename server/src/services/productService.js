const prisma = require('../config/db');
const ApiError = require('../utils/apiError');

const addProduct = async (data) => {
  const {
    name,
    description,
    price,
    stock,
    categories = [],
    images = [],
  } = data;

  if (!name || !description || price === undefined) {
    throw new ApiError(400, 'Please provide name, description, and price');
  }

  // Handle categories connection or creation
  const categoryConnectOrCreate = categories.map((catName) => ({
    where: { name: catName },
    create: { name: catName },
  }));

  // Handle images creation
  const imageCreates = images.map((url) => ({
    url,
  }));

  const product = await prisma.product.create({
    data: {
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock) || 0,
      categories: {
        connectOrCreate: categoryConnectOrCreate,
      },
      images: {
        create: imageCreates,
      },
    },
    include: {
      categories: true,
      images: true,
    },
  });

  return product;
};

const removeProduct = async (id) => {
  const productExists = await prisma.product.findUnique({
    where: { id },
  });

  if (!productExists) {
    throw new ApiError(404, 'Product not found');
  }

  await prisma.product.delete({
    where: { id },
  });

  return { message: 'Product removed successfully' };
};

const getSingleProduct = async (id) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      categories: true,
      images: true,
    },
  });

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  return product;
};

const listProducts = async () => {
  const products = await prisma.product.findMany({
    include: {
      categories: true,
      images: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return products;
};

module.exports = {
  addProduct,
  removeProduct,
  getSingleProduct,
  listProducts,
};
