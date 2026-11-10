#import <Foundation/Foundation.h>

@protocol SecureViewEventSink <NSObject>
- (void)secureViewOpened:(NSString *)cardId;
- (void)secureViewValidationFailed:(NSString *)code message:(NSString *)message;
- (void)secureViewDataShown:(NSString *)cardId;
- (void)secureViewClosed:(NSString *)cardId reason:(NSString *)reason;
@end
