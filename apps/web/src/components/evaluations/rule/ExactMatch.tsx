import {
  RuleEvaluationExactMatchConfiguration,
  RuleEvaluationExactMatchSpecification,
} from '@latitude-data/constants'
import { IconName } from '@latitude-data/web-ui'

const specification = RuleEvaluationExactMatchSpecification
export default {
  ...specification,
  icon: 'equal' as IconName,
  configurationForm: ConfigurationForm,
}

function ConfigurationForm({
  configuration,
  onChange,
}: {
  configuration: RuleEvaluationExactMatchConfiguration
  onChange: (configuration: RuleEvaluationExactMatchConfiguration) => void
}) {
  return <div>ExactMatch</div>
}
