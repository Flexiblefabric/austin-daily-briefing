"""Reference checks for approved editorial rules; not production-engine tests."""
def eligible(parts, source=True, enabled=True, repeat_ok=True, section=True):
    return all((source, enabled, repeat_ok, section, sum(parts)>=60, parts[1]>=15, parts[4]>=5))
def displace(new_total, old_total, new_value, old_value, limit, eligible=True):
    return eligible and old_total-new_total<=limit and old_value-new_value<=3
checks = {
 "weights_shared": sum([20,20,15,15,10,10,10])==100,
 "weights_mfy": sum([25,25,20,10,10,10])==100,
 "comedy_high_75": sum([23,20,14,3,9,6])==75,
 "comedy_normal_65": sum([18,18,13,3,8,5])==65,
 "astronomy_normal_65": sum([18,19,12,3,8,5])==65,
 "exact_60_pass": eligible([18,15,12,3,6,6]),
 "59_fail": not eligible([18,15,11,3,6,6]),
 "value14_fail": not eligible([25,14,20,10,10,10]),
 "substance4_fail": not eligible([25,25,20,10,4,10]),
 "source_fail": not eligible([23,20,14,3,9,6], source=False),
 "off_fail": not eligible([23,20,14,3,9,6], enabled=False),
 "repeat_fail": not eligible([23,20,14,3,9,6], repeat_ok=False),
 "section_fail": not eligible([23,20,14,3,9,6], section=False),
 "variety5_pass": displace(75,80,17,20,5),
 "variety6_fail": not displace(74,80,17,20,5),
 "discovery10_pass": displace(70,80,17,20,10),
 "discovery11_fail": not displace(69,80,17,20,10),
 "reader_drop4_fail": not displace(75,80,16,20,10),
 "floor_cannot_be_rescued": not displace(59,69,18,20,10,eligible=False),
}
assert all(checks.values()), [k for k,v in checks.items() if not v]
print(f"{len(checks)} reference boundary checks passed. No production workflow executed.")
