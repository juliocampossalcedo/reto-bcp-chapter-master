#import <Foundation/Foundation.h>

@protocol CustomMapEventSink <NSObject>
- (void)mapDidPressMarker:(NSString *)markerId;
- (void)mapDidBecomeAvailable;
@end
