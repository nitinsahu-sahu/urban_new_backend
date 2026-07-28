# urban_new_backend

## Store-review phone OTP access

SMS delivery can be bypassed only for a dedicated store-review account. The
bypass is disabled unless all values below are configured in the deployment
environment (never expose the OTP in the Flutter app):

```env
REVIEW_OTP_BYPASS_ENABLED=true
REVIEW_OTP_PHONE=1234567890
REVIEW_OTP_CODE=1234
```

The configured phone number must belong to an active, non-deleted user. All
other numbers continue through Message Central normally. Set
`REVIEW_OTP_BYPASS_ENABLED=false` or remove it after store review.
