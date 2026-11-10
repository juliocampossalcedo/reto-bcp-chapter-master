#import <React/RCTViewComponentView.h>
#import <react/renderer/components/IoNativeComponentsSpec/ComponentDescriptors.h>
#import <react/renderer/components/IoNativeComponentsSpec/EventEmitters.h>
#import <react/renderer/components/IoNativeComponentsSpec/Props.h>
#import "CustomMapEventSink.h"
#import "IoNativeComponents-Swift.h"

using namespace facebook::react;

@interface CustomMapComponentView : RCTViewComponentView <CustomMapEventSink>
@end

@implementation CustomMapComponentView {
  CustomMapCanvasView *_map;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<CustomMapComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    _props = CustomMapShadowNode::defaultSharedProps();
    _map = [[CustomMapCanvasView alloc] initWithFrame:self.bounds];
    _map.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
    _map.eventSink = self;
    [self addSubview:_map];
  }
  return self;
}

- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps
{
  const auto &newProps = static_cast<const CustomMapProps &>(*props);
  NSMutableArray<NSDictionary<NSString *, id> *> *markers = [NSMutableArray arrayWithCapacity:newProps.markers.size()];
  for (const auto &marker : newProps.markers) {
    [markers addObject:@{ @"id": [NSString stringWithUTF8String:marker.id.c_str()],
                          @"latitude": @(marker.latitude),
                          @"longitude": @(marker.longitude),
                          @"title": [NSString stringWithUTF8String:marker.title.c_str()] }];
  }
  [_map setMarkers:markers];
  [_map setSelectedMarkerId:newProps.selectedMarkerId.empty() ? nil : [NSString stringWithUTF8String:newProps.selectedMarkerId.c_str()]];
  [super updateProps:props oldProps:oldProps];
}

- (void)mapDidPressMarker:(NSString *)markerId
{
  if (_eventEmitter) {
    auto emitter = std::static_pointer_cast<const CustomMapEventEmitter>(_eventEmitter);
    emitter->onMarkerPress({ std::string(markerId.UTF8String) });
  }
}

- (void)mapDidBecomeAvailable
{
  if (_eventEmitter) {
    auto emitter = std::static_pointer_cast<const CustomMapEventEmitter>(_eventEmitter);
    emitter->onMapStatus({ "loaded" });
  }
}

- (void)updateEventEmitter:(const EventEmitter::Shared &)eventEmitter
{
  [super updateEventEmitter:eventEmitter];
  if (_map.window != nil && _eventEmitter) {
    [self mapDidBecomeAvailable];
  }
}

@end
