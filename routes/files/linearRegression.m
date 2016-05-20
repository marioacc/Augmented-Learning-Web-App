function X = linearRegression(A,b)
  invAtporA=pinv(A'*A)
  atporb= A'*b
  X=(pinv(A'*A))*(A'*b);
