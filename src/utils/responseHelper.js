export const successResponse = (res, message, data, status = 200) => {
  res.status(status).json({
    success: true,
    message,
    data,
  });
};

export const errorResponse = (res, message, errors = [], status = 400) => {
  res.status(status).json({
    success: false,
    message,
    errors,
  });
};

export const paginatedResponse = (res, data, page, limit, total, message = 'Success') => {
  res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
};
