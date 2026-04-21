CDK_DIR := infrastructure/cdk

.PHONY: all synth diff

all: synth diff

synth:
	cd $(CDK_DIR) && cdk synth

diff:
	cd $(CDK_DIR) && cdk diff
